"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import projects from "@/data/projects";
import { phoneShot } from "@/lib/phone-shot";

/**
 * /projects as an app drawer: one large row per app. On pointer devices a small phone follows the
 * cursor and shows the hovered app's first screen.
 */
export function ProjectIndex() {
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = preview.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX + 32);
      y(e.clientY - 160);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <ul className="drawer" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => {
          const stack = [...p.skills.frontend, ...p.skills.backend].map((s) => s.title).join(", ");
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="drawer-row"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className="drawer-icon" style={{ background: p.tint }} aria-hidden>
                  {p.title.slice(0, 1)}
                </span>
                <span className="drawer-title">{p.title}</span>
                <span className="drawer-meta">
                  <span className="text-(--ink)">{p.category}</span>
                  <br />
                  {stack}
                </span>
                <span className="drawer-tags">
                  {p.live ? <span>On Google Play</span> : null}
                  <span>{p.shots.length} screens</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div ref={preview} className={`drawer-preview ${active !== null ? "on" : ""}`} aria-hidden>
        <div className="device-screen" style={{ background: active !== null ? projects[active].tint : undefined }}>
          {projects.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative preview
            <img key={p.id} src={phoneShot(p.shots[0])} alt="" className={i === active ? "on" : ""} />
          ))}
        </div>
      </div>
    </>
  );
}
