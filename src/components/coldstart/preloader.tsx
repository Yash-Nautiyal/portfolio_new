"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "./smooth-scroll";

const MAX_WAIT = 8000; // never hold the page longer than this, even on a bad connection

/**
 * Full-screen boot screen for the homepage. Holds scrolling until fonts and every image the phone
 * (and its iPad/iPhone) will show are downloaded and decoded, so nothing pops in mid-scroll.
 * Progress is real: one step per asset.
 */
export function Preloader() {
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(1);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("preloading");
    window.scrollTo(0, 0);
    getLenis()?.stop();

    const imgs = [...document.querySelectorAll<HTMLImageElement>(".rig img, #home img")];
    const tasks: Promise<unknown>[] = [
      document.fonts.ready,
      ...imgs.map((img) => {
        if (img.loading === "lazy") img.loading = "eager";
        const loaded = img.complete
          ? Promise.resolve()
          : new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            });
        return loaded.then(() => img.decode().catch(() => {}));
      }),
    ];
    queueMicrotask(() => setTotal(tasks.length));
    tasks.forEach((t) => t.then(() => setDone((d) => d + 1)));

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.classList.remove("preloading");
      getLenis()?.start();
      root.current?.classList.add("out");
      window.setTimeout(() => setGone(true), 700);
    };
    Promise.all(tasks).then(() => window.setTimeout(finish, 250));
    const cap = window.setTimeout(finish, MAX_WAIT);
    return () => {
      clearTimeout(cap);
      html.classList.remove("preloading");
    };
  }, []);

  if (gone) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div ref={root} className="preloader" role="progressbar" aria-label="Loading" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className="preloader-mark">YN</span>
      <span className="preloader-bar">
        <span style={{ transform: `scaleX(${done / total})` }} />
      </span>
      <span className="preloader-pct">{pct}%</span>
    </div>
  );
}
