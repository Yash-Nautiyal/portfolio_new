type SectionHeaderProps = {
  label: string;
  title: string;
  subtitle?: string;
};

/** Shared section intro. `label` stays in the data for nav/SEO use but isn't rendered: no eyebrow labels. */
export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-sub">{subtitle}</p> : null}
    </header>
  );
}
