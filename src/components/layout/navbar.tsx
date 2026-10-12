"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AppWindow,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  House,
  LayoutGrid,
  Mail,
  Moon,
  Signal,
  Smartphone,
  SquareUser,
  Wifi,
} from "lucide-react";
import { config } from "@/data/config";
import { ThemeToggle, useDarkTheme } from "./theme-toggle";

const sections = [
  { label: "Home", href: "#home", icon: House },
  { label: "Skills", href: "#skills", icon: LayoutGrid },
  { label: "Experience", href: "#experience", icon: BriefcaseBusiness },
  { label: "Projects", href: "#projects", icon: Smartphone },
  { label: "Contact", href: "#contact", icon: Mail },
];

const subscribeClock = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};
const readClock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

/** Battery that fills with page scroll progress. */
function Battery({ progress }: { progress: number }) {
  return (
    <span className="sb-battery" aria-hidden>
      <span className="sb-battery-pct">{Math.round(progress * 100)}%</span>
      <svg width="24" height="12" viewBox="0 0 24 12">
        <rect x="0.5" y="0.5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.5" />
        <rect x="2" y="2" width={Math.max(1, 17 * progress)} height="8" rx="1.5" fill="currentColor" />
        <rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    </span>
  );
}

/**
 * Top bar as an Android status bar: name and live clock, section links with a sliding indicator,
 * signal/Wi-Fi/battery (battery = scroll progress). Below 768px the links move into quick settings,
 * pulled down from the chevron (the only navigation on phones).
 */
export function Navbar() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [active, setActive] = useState("home");
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const time = useSyncExternalStore(subscribeClock, readClock, () => "");
  const { isDark, toggle } = useDarkTheme();
  const list = useRef<HTMLUListElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, on: false });
  const shadeId = useId();

  // Active section + scroll progress.
  useEffect(() => {
    const ids = sections.map((s) => s.href.slice(1));
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
      if (!home) return;
      const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
      let current = els[0]?.id ?? "home";
      for (const el of els) if (el.getBoundingClientRect().top <= innerHeight * 0.35) current = el.id;
      if (innerHeight + scrollY >= document.body.offsetHeight - 4) current = els[els.length - 1]?.id ?? current;
      setActive(current);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [home]);

  // Slide the indicator under the active link.
  useLayoutEffect(() => {
    const a = list.current?.querySelector<HTMLElement>(`a[data-id="${active}"]`);
    if (!home || !a || !list.current) return setIndicator((i) => ({ ...i, on: false }));
    const l = list.current.getBoundingClientRect();
    const r = a.getBoundingClientRect();
    setIndicator({ x: r.left - l.left, w: r.width, on: true });
  }, [active, home]);

  // Quick settings: Escape or a click outside closes it and returns focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        opener.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!shade.current?.contains(t) && !opener.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const sectionHref = (href: string) => (home ? href : `/${href}`);
  const close = () => setOpen(false);

  return (
    <>
      <header className="statusbar-nav">
        <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex shrink-0 items-baseline gap-3 whitespace-nowrap">
            <span className="font-(family-name:--font-display) text-lg font-bold tracking-tight">{config.author}</span>
            <span className="sb-time md:hidden lg:inline" aria-hidden>
              {time}
            </span>
          </Link>

          <ul ref={list} className="relative mx-auto hidden items-center md:flex lg:gap-1">
            {sections.map((s) => {
              const id = s.href.slice(1);
              const on = home && active === id;
              return (
                <li key={s.label}>
                  <Link
                    href={sectionHref(s.href)}
                    data-id={id}
                    aria-current={on ? "location" : undefined}
                    className={`sb-link ${on ? "on" : ""}`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
            <span
              className="sb-indicator"
              aria-hidden
              style={{ transform: `translateX(${indicator.x}px)`, width: indicator.w, opacity: indicator.on ? 1 : 0 }}
            />
          </ul>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <span className="hidden items-center gap-1.5 text-(--ink-2) sm:flex md:hidden lg:flex" aria-hidden>
              <Signal size={14} />
              <Wifi size={14} />
            </span>
            <Battery progress={progress} />
            <a href={config.resume} target="_blank" rel="noreferrer" className="sb-resume hidden md:inline-flex">
              Resume
            </a>
            <span className="hidden md:block">
              <ThemeToggle />
            </span>
            <button
              ref={opener}
              type="button"
              className={`sb-chevron md:hidden ${open ? "open" : ""}`}
              aria-expanded={open}
              aria-controls={shadeId}
              aria-label="Quick settings"
              onClick={() => setOpen((o) => !o)}
            >
              <ChevronDown size={18} aria-hidden />
            </button>
          </div>
        </nav>

        <div
          ref={shade}
          id={shadeId}
          className={`quick-settings md:hidden ${open ? "open" : ""}`}
          role="region"
          aria-label="Quick settings"
          inert={!open}
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-4 lg:grid-cols-5">
            {sections.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={sectionHref(href)} className="qs-tile" onClick={close}>
                <Icon size={18} aria-hidden />
                {label}
              </Link>
            ))}
            <Link href="/projects" className="qs-tile" onClick={close}>
              <AppWindow size={18} aria-hidden />
              All projects
            </Link>
            <Link href="/about" className="qs-tile" onClick={close}>
              <SquareUser size={18} aria-hidden />
              About
            </Link>
            <a href={config.resume} target="_blank" rel="noreferrer" className="qs-tile" onClick={close}>
              <FileText size={18} aria-hidden />
              Resume
            </a>
            <button type="button" className={`qs-tile ${isDark ? "on" : ""}`} aria-pressed={isDark} onClick={toggle}>
              <Moon size={18} aria-hidden />
              Dark theme
            </button>
          </div>
        </div>
      </header>

    </>
  );
}
