"use client";

import { useEffect, useState } from "react";
import { CASE_SHOT_EVENT } from "./project-gallery";
import { phoneShot } from "@/lib/phone-shot";

/**
 * Sticky phone beside the case study. It shows the first screen of whichever gallery
 * crosses the middle of the viewport, and any screen hovered/focused in a gallery.
 */
export function CasePhone({ initial, tint }: { initial: string; tint: string }) {
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    const galleries = document.querySelectorAll<HTMLElement>(".case-gallery");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const shots = JSON.parse((e.target as HTMLElement).dataset.shots ?? "[]") as string[];
          if (shots[0]) setSrc(shots[0]);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    galleries.forEach((g) => observer.observe(g));

    const onShot = (e: Event) => setSrc((e as CustomEvent<string>).detail);
    window.addEventListener(CASE_SHOT_EVENT, onShot);
    return () => {
      observer.disconnect();
      window.removeEventListener(CASE_SHOT_EVENT, onShot);
    };
  }, []);

  return (
    <div className="device" aria-hidden>
      <div className="device-screen" style={{ background: tint }}>
        <span className="device-camera" />
        {/* key restarts the fade-in on every change */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative mirror of the gallery images */}
        <img key={src} src={phoneShot(src)} alt="" className="case-phone-img" />
      </div>
    </div>
  );
}
