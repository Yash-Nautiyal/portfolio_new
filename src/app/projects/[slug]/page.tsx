import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CasePhone } from "@/components/project/case-phone";
import { PageTint } from "@/components/coldstart/page-tint";
import projects from "@/data/projects";

const PLAY_BADGE = "https://play.google.com/intl/en_us/badges/images/apps/en-play-badge.png";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.id === slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailsPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.id === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <PageTint color={project.tint} />
      <Navbar />
      <div className="case-progress" aria-hidden />
      <main id="main" className="flex-1">
        <Container>
          <header className="case-hero">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-(--ink-2) hover:text-(--ink)"
            >
              <ArrowLeft size={16} aria-hidden />
              All projects
            </Link>
            <p className="mt-12 text-(length:--step--1) text-(--ink-2)">{project.category}</p>
            <h1 className="mt-2 font-(family-name:--font-display) text-[clamp(3.25rem,11vw,9rem)] leading-[0.88] font-extrabold tracking-[-0.04em] [overflow-wrap:anywhere]">
              {project.title}
            </h1>
            <p className="mt-8 max-w-[52ch] text-(length:--step-1) leading-snug text-(--ink-2)">{project.summary}</p>

            <dl className="case-meta">
              <div>
                <dt>Frontend</dt>
                <dd>{project.skills.frontend.map((s) => s.title).join(", ")}</dd>
              </div>
              <div>
                <dt>Backend</dt>
                <dd>{project.skills.backend.map((s) => s.title).join(", ")}</dd>
              </div>
              <div>
                <dt>Links</dt>
                <dd className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-(--line) underline-offset-4 hover:decoration-(--ink)"
                    >
                      Source on GitHub
                    </a>
                  ) : null}
                  {project.live ? (
                    <a href={project.live} target="_blank" rel="noreferrer" className="block">
                      <Image src={PLAY_BADGE} alt={`Get ${project.title} on Google Play`} width={120} height={36} />
                    </a>
                  ) : null}
                </dd>
              </div>
            </dl>
          </header>

          <div className="case-layout">
            <article className="case-body" aria-labelledby="case-body-title">
              {/* The case content uses h3s; this keeps the outline h1 > h2 > h3 */}
              <h2 id="case-body-title" className="sr-only">
                Case study
              </h2>
              {project.content}
            </article>
            <aside className="case-aside">
              <div className="sticky top-[max(5rem,calc(50svh-320px))]">
                <CasePhone initial={project.shots[0]} tint={project.tint} />
              </div>
            </aside>
          </div>

          <Link href={`/projects/${next.id}`} className="case-next">
            <span className="text-(length:--step--1) text-(--ink-2)">Next case study</span>
            <span className="case-next-title">{next.title}</span>
            <span className="text-(length:--step-0) text-(--ink-2)">{next.category}</span>
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
