"use client";

import { useEffect, useRef } from "react";

/**
 * Wallpaper "Dust clock": slow dust motes, and (when `time` is set) the lock-screen clock rebuilt from
 * particles. The real `.lock-clock` text stays in place (transparent) so layout, size and font come from
 * CSS; particles are sampled from it. Pointer/finger pushes particles away, pressing scatters them, and
 * they spring back. Runs only while visible; reduced motion keeps the plain text clock.
 */

type Particle = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; s: number; a: number; ph: number };
const MOTES = 70;
const BOKEH = 9;

export function DustWallpaper({ time }: { time?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const setTime = useRef<(t?: string) => void>(() => {});

  useEffect(() => {
    const c = ref.current!;
    const root = c.parentElement!;
    const ctx = c.getContext("2d")!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0;
    let H = 0;
    let parts: Particle[] = [];
    let text: string | undefined;
    const motes = Array.from({ length: MOTES }, () => ({ x: Math.random(), y: Math.random(), v: Math.random(), s: 0.8 + Math.random() * 2.2 }));
    // Out-of-focus specks closer to the "lens": large, soft, slow, and they shift with the pointer.
    const bokeh = Array.from({ length: BOKEH }, () => ({ x: Math.random(), y: Math.random(), r: 6 + Math.random() * 12, v: Math.random() }));
    const ptr = { x: -1e4, y: -1e4, on: false, down: false };

    // Canvas-local coordinates, correct even when the phone is scaled or tilted.
    const local = (cx: number, cy: number) => {
      const r = c.getBoundingClientRect();
      if (!r.width) return null;
      return { x: ((cx - r.left) * W) / r.width, y: ((cy - r.top) * H) / r.height, inside: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom };
    };

    const build = () => {
      const el = root.querySelector<HTMLElement>(".lock-clock");
      if (!el || !text || !W) {
        parts = [];
        root.classList.remove("dust-on");
        return;
      }
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const cr = c.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const k = W / (cr.width || W);
      const cx = (er.left + er.width / 2 - cr.left) * k;
      const cy = (er.top + er.height / 2 - cr.top) * k;

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d")!;
      o.fillStyle = "#fff";
      o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillText(text, cx, cy + size * 0.04);
      const data = o.getImageData(0, 0, W, H).data;
      const step = size >= 96 ? 4 : 3;
      const targets: [number, number][] = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 140) targets.push([x, y]);

      // Reuse particles so a minute change morphs digits instead of restarting.
      while (parts.length < targets.length)
        parts.push({
          x: Math.random() * W,
          y: H + Math.random() * 40,
          vx: 0,
          vy: 0,
          hx: 0,
          hy: 0,
          s: 1 + Math.random() * 0.9, // radius in px: grains ~2–3.8px across
          a: 0.6 + Math.random() * 0.4,
          ph: Math.random() * 6.28,
        });
      parts.length = targets.length;
      // Jittered homes: grains, not a dot-matrix grid.
      parts.forEach((p, i) => {
        p.hx = targets[i][0] + (Math.random() - 0.5) * step * 1.2;
        p.hy = targets[i][1] + (Math.random() - 0.5) * step * 1.2;
      });
      // Only hide the text clock once there is dust to draw it (falls back to plain text otherwise).
      root.classList.toggle("dust-on", parts.length > 0);
    };

    const resize = () => {
      W = c.offsetWidth;
      H = c.offsetHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      build();
    };

    const scatter = () => parts.forEach((p) => {
      p.x = Math.random() * W;
      p.y = H * 0.6 + Math.random() * H * 0.4;
      p.vx = p.vy = 0;
    });

    setTime.current = (t) => {
      text = t;
      build();
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      // A canvas can be 0×0 for a frame (before layout/resize); nothing to draw and the maths would divide by zero.
      if (!W || !H) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const t = performance.now() / 1000;
      const px = ptr.on ? ptr.x / W - 0.5 : Math.sin(t * 0.2) * 0.2;
      const py = ptr.on ? ptr.y / H - 0.5 : 0;

      // Light falling from the top of the screen; the dust floats through it.
      const beam = ctx.createRadialGradient(W * 0.5, -H * 0.08, 0, W * 0.5, -H * 0.08, H * 0.75);
      beam.addColorStop(0, "rgba(236,226,206,0.16)");
      beam.addColorStop(0.55, "rgba(236,226,206,0.05)");
      beam.addColorStop(1, "rgba(236,226,206,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, W, H);

      for (const b of bokeh) {
        b.y -= 0.00025 + b.v * 0.0003;
        if (b.y < -0.1) b.y = 1.1;
        const bx = b.x * W - px * 18 * (0.5 + b.v);
        const by = b.y * H - py * 14 * (0.5 + b.v);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        g.addColorStop(0, `rgba(236,226,206,${0.1 + 0.08 * b.v})`);
        g.addColorStop(1, "rgba(236,226,206,0)");
        ctx.fillStyle = g;
        ctx.fillRect(bx - b.r, by - b.r, b.r * 2, b.r * 2);
      }

      for (const m of motes) {
        m.y -= 0.0007 + m.v * 0.0009;
        if (m.y < -0.02) m.y = 1.02;
        // Brighter inside the light beam near the top
        const lit = Math.max(0, 1 - m.y * 1.3);
        ctx.fillStyle = `rgba(236,226,206,${0.22 + 0.3 * m.v + 0.3 * lit})`;
        ctx.beginPath();
        ctx.arc(m.x * W + Math.sin(t * 0.9 + m.v * 9) * 4 - px * 6 * m.v, m.y * H - py * 4 * m.v, m.s * 0.6, 0, 6.283);
        ctx.fill();
      }

      const reach = ptr.down ? 2600 : 900;
      const push = ptr.down ? 4 : 1.4;
      for (const p of parts) {
        if (ptr.on) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
          const dd = dx * dx + dy * dy;
          if (dd < reach) {
            const f = push / Math.sqrt(dd + 1);
            p.vx += dx * f;
            p.vy += dy * f;
          }
        }
        // Each grain breathes a little around its home, so the digits feel loose, like settled dust.
        const hx = p.hx + Math.sin(t * 0.8 + p.ph) * 0.45;
        const hy = p.hy + Math.cos(t * 0.6 + p.ph * 1.3) * 0.45;
        p.vx = (p.vx + (hx - p.x) * 0.03) * 0.85;
        p.vy = (p.vy + (hy - p.y) * 0.03) * 0.85;
        p.x += p.vx;
        p.y += p.vy;
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 3);
        ctx.fillStyle = `rgba(${(240 - 90 * sp) | 0},${(234 - 21 * sp) | 0},${(226 - 50 * sp) | 0},${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, 6.283);
        ctx.fill();
      }
    };

    let raf = 0;
    let visible = false;
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && document.visibilityState === "visible") raf = requestAnimationFrame(frame);
    };
    // Each time the screen comes back into view the dust settles into the clock again.
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) scatter();
      run();
    });
    io.observe(c);
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const onMove = (e: PointerEvent) => {
      const l = local(e.clientX, e.clientY);
      ptr.on = !!l?.inside;
      if (l) Object.assign(ptr, { x: l.x, y: l.y });
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const l = local(t.clientX, t.clientY);
      ptr.on = !!l?.inside;
      ptr.down = ptr.on;
      if (l) Object.assign(ptr, { x: l.x, y: l.y });
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      ptr.down = ptr.on;
    };
    const onUp = () => {
      ptr.down = false;
    };
    const onEnd = () => Object.assign(ptr, { on: false, down: false });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("visibilitychange", run);
    document.fonts.ready.then(build);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.classList.remove("dust-on");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onEnd);
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  useEffect(() => setTime.current(time), [time]);

  return <canvas ref={ref} className="dust" aria-hidden />;
}
