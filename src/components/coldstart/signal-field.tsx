"use client";

import { useEffect, useRef } from "react";

/**
 * Background: signal-strength contours. Every visible device is a transmitter, the cursor a weak
 * one; isolines of the summed field are traced with marching squares on a coarse grid each frame.
 */

const CELL = 8; // px per field sample
// 16 rings, log-spaced so they stay evenly apart from the edge of the screen down to the device
const LEVELS = Array.from({ length: 16 }, (_, i) => 1.6 * Math.pow(1.3, i));
const DEVICES = ".rig .device, .rig .iphone, .rig .ipad, .case-aside .device";

type Source = { x: number; y: number; s: number };

// Resolve any CSS colour (hex, rgb(), named) to [r, g, b].
function toRgb(probe: HTMLElement, value: string): [number, number, number] {
  probe.style.color = value;
  const m = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) ?? ["47", "106", "74"];
  return [+m[0], +m[1], +m[2]];
}

export function SignalField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, cols = 0, rows = 0, dpr = 1;
    let field = new Float32Array(0);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 1.5);
      w = innerWidth;
      h = innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      field = new Float32Array(cols * rows);
      if (reduce) draw(0);
    };

    const mouse = { x: -1e4, y: -1e4, on: false };
    // Mouse: always a source. Touch: a source only while the finger is down.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => (mouse.on = false);
    const onUp = (e: PointerEvent) => e.pointerType !== "mouse" && onLeave();

    // Colour follows the project tint when one is active, else the accent.
    let rgb: [number, number, number] = [47, 106, 74];
    let dark = false;
    const readColour = () => {
      const root = getComputedStyle(document.documentElement);
      const tinted = parseFloat(root.getPropertyValue("--tint-amt")) > 0;
      rgb = toRgb(probe, (tinted ? root.getPropertyValue("--tint") : root.getPropertyValue("--accent")).trim());
      dark = document.documentElement.classList.contains("dark");
    };
    readColour();
    const colourTimer = window.setInterval(readColour, 400);

    const sources = (): Source[] => {
      const list: Source[] = [];
      document.querySelectorAll<HTMLElement>(DEVICES).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || getComputedStyle(el).visibility === "hidden") return;
        if (r.bottom < -200 || r.top > h + 200) return;
        list.push({ x: r.left + r.width / 2, y: r.top + r.height * 0.35, s: el.classList.contains("device") ? 1 : 0.7 });
      });
      if (!list.length) list.push({ x: w * 0.82, y: h * 0.18, s: 0.9 }); // no device on screen
      if (mouse.on) list.push({ x: mouse.x, y: mouse.y, s: 0.45 });
      return list;
    };

    function draw(t: number) {
      const src = sources();
      const phase = window.scrollY * 0.004 + t * 0.00035;
      for (let j = 0; j < rows; j++) {
        const y = j * CELL;
        for (let i = 0; i < cols; i++) {
          const x = i * CELL;
          let v = 0;
          for (const s of src) v += (s.s * 1400) / (Math.hypot(x - s.x, y - s.y) + 40);
          // Slow terrain so the rings breathe instead of being perfect circles.
          v *= 1 + 0.12 * Math.sin(x * 0.006 + phase) * Math.cos(y * 0.007 - phase * 1.3);
          field[j * cols + i] = v;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const [r, g, b] = rgb;
      LEVELS.forEach((lv, li) => {
        const a = (dark ? 0.08 : 0.06) + li * (dark ? 0.014 : 0.012);
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const A = field[j * cols + i], B = field[j * cols + i + 1];
            const C = field[(j + 1) * cols + i + 1], D = field[(j + 1) * cols + i];
            const k = (A > lv ? 8 : 0) | (B > lv ? 4 : 0) | (C > lv ? 2 : 0) | (D > lv ? 1 : 0);
            if (k === 0 || k === 15) continue;
            const X = i * CELL, Y = j * CELL;
            // Edge crossings, linearly interpolated for smooth lines.
            const tx = X + CELL * ((lv - A) / (B - A)), ry = Y + CELL * ((lv - B) / (C - B));
            const bx = X + CELL * ((lv - D) / (C - D)), ly = Y + CELL * ((lv - A) / (D - A));
            const seg = (x1: number, y1: number, x2: number, y2: number) => {
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
            };
            switch (k) {
              case 1: case 14: seg(X, ly, bx, Y + CELL); break;
              case 2: case 13: seg(bx, Y + CELL, X + CELL, ry); break;
              case 3: case 12: seg(X, ly, X + CELL, ry); break;
              case 4: case 11: seg(tx, Y, X + CELL, ry); break;
              case 6: case 9: seg(tx, Y, bx, Y + CELL); break;
              case 7: case 8: seg(X, ly, tx, Y); break;
              case 5: seg(X, ly, tx, Y); seg(bx, Y + CELL, X + CELL, ry); break;
              case 10: seg(X, ly, bx, Y + CELL); seg(tx, Y, X + CELL, ry); break;
            }
          }
        }
        ctx.stroke();
      });
    }

    // 30fps is plenty for slow contours; skipping frames keeps the main thread free while scrolling.
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 33) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(colourTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      probe.remove();
    };
  }, []);

  return <canvas ref={canvas} className="signal-field" aria-hidden />;
}
