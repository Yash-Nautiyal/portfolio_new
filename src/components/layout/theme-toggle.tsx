"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

// The inline script in layout.tsx sets the class before paint; this reads it without a hydration mismatch.
function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const readDark = () => document.documentElement.classList.contains("dark");

/** Current theme and a toggle; shared by the bar button and the quick-settings tile. */
export function useDarkTheme() {
  const isDark = useSyncExternalStore(subscribe, readDark, () => false);
  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return { isDark, toggle };
}

export function ThemeToggle() {
  const { isDark, toggle } = useDarkTheme();
  return (
    <button
      type="button"
      aria-label="Dark theme"
      aria-pressed={isDark}
      onClick={toggle}
      className="grid size-9 place-items-center rounded-full text-(--ink) hover:bg-(--surface-hover)"
    >
      <Sun size={18} className="hidden dark:block" aria-hidden />
      <Moon size={18} className="dark:hidden" aria-hidden />
    </button>
  );
}
