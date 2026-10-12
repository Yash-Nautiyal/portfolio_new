import type { InputHTMLAttributes } from "react";

// Material 3 filled text field: tinted fill, bottom indicator that turns accent on focus.
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full mt-2 rounded-t-xl border-b-2 border-(--line) bg-(--surface) px-4 py-3.5 text-base text-(--ink) placeholder:text-(--ink-2) transition-colors focus-visible:border-(--accent) focus-visible:outline-none ${props.className ?? ""}`}
    />
  );
}
