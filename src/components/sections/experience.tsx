import { SectionHeader } from "@/components/layout/section-header";
import { EXPERIENCE, SKILLS } from "@/data/experience";
import { experienceSectionMeta } from "@/data/section-metadata";
import { renderHighlightedBullet } from "@/lib/highlight-bullet";

// Desktop: the phone's shade stays down for the whole section, notifications grouped by company; the job
// in view expands and its bullets land one by one, lighting up here (stage.tsx). Mobile: each list is the shade.
export function ExperienceSection() {
  return (
    <section id="experience" className="scroll-mt-16 py-14 sm:py-20">
      <SectionHeader
        label={experienceSectionMeta.label}
        title={experienceSectionMeta.title}
        subtitle={experienceSectionMeta.subtitle}
      />

      <div className="exp-chapters">
      {EXPERIENCE.map((item) => (
        <article
          key={item.id}
          data-exp={item.id}
          aria-labelledby={`exp-${item.id}`}
          className="exp-chapter"
          style={{ "--n": item.description.length } as React.CSSProperties}
        >
          <div className="exp-sticky">
            <p className="text-(length:--step--1) text-(--ink-2)">
              {item.startDate} – {item.endDate}
            </p>
            <h3
              id={`exp-${item.id}`}
              className="mt-2 font-(family-name:--font-display) text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.92] font-extrabold tracking-[-0.035em]"
            >
              {item.company}
            </h3>
            <p className="mt-3 text-(length:--step-1) text-(--ink)">{item.title}</p>
            <p className="mt-4 max-w-[52ch] text-(length:--step--1) text-(--ink-2)">
              {item.skills.map((s) => SKILLS[s].label).join(", ")}
            </p>

            <ol className="exp-list">
              {item.description.map((bullet, i) => (
                <li key={bullet} data-i={i}>
                  <span className="exp-app" aria-hidden>
                    {item.company.slice(0, 1)}
                  </span>
                  <span className="exp-meta" aria-hidden>
                    {item.company}
                  </span>
                  <span className="exp-text">{renderHighlightedBullet(bullet, item.highlights)}</span>
                </li>
              ))}
            </ol>
          </div>
        </article>
      ))}
      </div>
    </section>
  );
}
