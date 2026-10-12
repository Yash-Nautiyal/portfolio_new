"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;
/** The running Lenis, for programmatic scrolls (null on first paint or if it failed to start). */
export const getLenis = () => instance;

/** Smoothly scroll to y. Falls back to native smooth scroll when Lenis isn't running. */
export function glideTo(y: number, onDone: () => void) {
  // Touch screens scroll natively (Lenis doesn't smooth touch), so use native smooth scrolling there too.
  if (instance && !window.matchMedia("(pointer: coarse)").matches) {
    instance.scrollTo(y, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 3), lock: true, onComplete: onDone });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
    setTimeout(onDone, 900);
  }
}

/**
 * Weighted, slightly slow wheel scrolling. GSAP's ticker drives Lenis so every
 * ScrollTrigger reads the same smoothed position on the same frame.
 * Touch keeps native scrolling; reduced motion turns smoothing off (Lenis default).
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.85,
      autoRaf: false,
      anchors: true, // sections carry scroll-mt-16 for the 64px header
    });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
