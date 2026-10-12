import type { ReactNode } from "react";

/** Inner-page header: one large display title, an optional lead, optional content under it. */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="pt-10 pb-12 sm:pt-16">
      <h1 className="font-(family-name:--font-display) text-[clamp(3.25rem,10vw,8rem)] leading-[0.88] font-extrabold tracking-[-0.04em]">
        {title}
      </h1>
      {description ? (
        <p className="mt-8 max-w-[52ch] text-(length:--step-1) leading-snug text-(--ink-2)">{description}</p>
      ) : null}
      {children}
    </header>
  );
}
