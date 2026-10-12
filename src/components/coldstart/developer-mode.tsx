"use client";

import { useRef, useState, useSyncExternalStore } from "react";

/**
 * Android's hidden developer options: tap "Build number" 7 times. Turning it on adds `.dev-bounds`
 * to <html>, which outlines every element like "Show layout bounds" (globals.css). Kept for the
 * session; layout.tsx's inline script re-applies it before paint.
 */
const KEY = "coldstart-dev";
const TAPS = 7;

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
}
const readOn = () => document.documentElement.classList.contains("dev-bounds");
const useDevMode = () => useSyncExternalStore(subscribe, readOn, () => false);

function setDevMode(on: boolean) {
  document.documentElement.classList.toggle("dev-bounds", on);
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {}
}

/** The "Build number" row on /about. */
export function BuildNumber({ value }: { value: string }) {
  const on = useDevMode();
  const taps = useRef(0);
  const [message, setMessage] = useState("");

  const tap = () => {
    if (on) {
      setMessage("No need, you are already a developer.");
      return;
    }
    taps.current += 1;
    const left = TAPS - taps.current;
    if (left <= 0) {
      setDevMode(true);
      setMessage("You are now a developer! Layout bounds are on.");
      taps.current = 0;
    } else if (left <= 4) {
      setMessage(`You are now ${left} ${left === 1 ? "step" : "steps"} away from being a developer.`);
    }
  };

  return (
    <div className="about-row">
      <dt>Build number</dt>
      <dd>
        <button type="button" onClick={tap} className="build-number">
          {value}
        </button>
        <span className="build-toast" role="status">
          {message}
        </span>
      </dd>
    </div>
  );
}

/** Floating chip shown on every page while developer mode is on. */
export function DevModeChip() {
  const on = useDevMode();
  if (!on) return null;
  return (
    <div className="dev-chip" role="status">
      Developer options: layout bounds on
      <button type="button" onClick={() => setDevMode(false)}>
        Turn off
      </button>
    </div>
  );
}
