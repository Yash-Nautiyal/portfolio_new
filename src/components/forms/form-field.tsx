import type { ReactNode } from "react";

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-(--ink)">{label}</span>
      {children}
    </label>
  );
}
