"use client";

import { useEffect } from "react";

/** Tints the page paper with an app colour while this page is mounted (Material You style). */
export function PageTint({ color, amount = "7%" }: { color: string; amount?: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tint", color);
    root.style.setProperty("--tint-amt", amount);
    return () => {
      root.style.removeProperty("--tint");
      root.style.removeProperty("--tint-amt");
    };
  }, [color, amount]);
  return null;
}
