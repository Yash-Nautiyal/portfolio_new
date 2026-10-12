import Image from "next/image";
import Link from "next/link";
import projects from "@/data/projects";
import { projectsSectionMeta } from "@/data/section-metadata";
import { SectionHeader } from "@/components/layout/section-header";

const PLAY_BADGE = "https://play.google.com/intl/en_us/badges/images/apps/en-play-badge.png";

// Desktop: each chapter is tall so the docked phone can open the app and scroll its screens (stage.tsx).
// Mobile: the screens sit in a swipeable strip under the text.
export function FeaturedProjectsSection() {
  return (
    <section id="projects" className="scroll-mt-16 py-14 sm:py-20">
      <SectionHeader
        label={projectsSectionMeta.label}
        title={projectsSectionMeta.title}
        subtitle={projectsSectionMeta.subtitle}
      />

      {projects.map((project) => {
        const stack = [...project.skills.frontend, ...project.skills.backend].map((s) => s.title);
        return (
          <article
            key={project.id}
            data-app={project.id}
            aria-labelledby={`project-${project.id}`}
            className="project-chapter"
          >
            <div className="project-sticky">
              <p className="text-(length:--step--1) text-(--ink-2)">{project.category}</p>
              <h3
                id={`project-${project.id}`}
                className="mt-2 font-(family-name:--font-display) text-[clamp(2.75rem,6.5vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.035em] [overflow-wrap:anywhere]"
              >
                {project.title}
              </h3>
              <p className="mt-6 max-w-[46ch] text-(length:--step-0) leading-relaxed text-(--ink-2)">
                {project.summary}
              </p>
              <p className="mt-5 max-w-[46ch] text-(length:--step--1) text-(--ink)">{stack.join(", ")}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="rounded-full bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-opacity hover:opacity-85"
                >
                  Read the case study
                </Link>
                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium underline decoration-(--line) underline-offset-4 hover:decoration-(--ink)"
                  >
                    Source on GitHub
                  </a>
                ) : null}
                {project.live ? (
                  <a href={project.live} target="_blank" rel="noreferrer" className="block">
                    <Image src={PLAY_BADGE} alt={`Get ${project.title} on Google Play`} width={135} height={40} />
                  </a>
                ) : null}
              </div>

              <p className="shot-count" aria-hidden>
                Screen 1 of {project.shots.length}
              </p>
            </div>

            <ul className="shot-strip" aria-label={`${project.title} screens`} tabIndex={0}>
              {project.shots.map((src, i) => (
                <li key={src}>
                  <Image
                    src={src}
                    alt={`${project.title} screen ${i + 1}`}
                    width={540}
                    height={1170}
                    sizes="220px"
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </article>
        );
      })}

      <Link
        href="/projects"
        className="mt-6 inline-block text-sm font-medium underline decoration-(--line) underline-offset-4 hover:decoration-(--ink)"
      >
        All projects
      </Link>
    </section>
  );
}
