import Link from "next/link";
import { config } from "@/data/config";
import { EXPERIENCE } from "@/data/experience";
import { MobileLock } from "@/components/coldstart/phone";

// Resting layout. stage.tsx scrubs from an opening frame (name edge to edge, phone rising) into this.
export function HeroSection() {
  const job = EXPERIENCE[0];
  return (
    <section id="home" aria-labelledby="hero-name" className="hero relative min-h-svh">
      <MobileLock />
      <div className="hero-inner flex min-h-svh flex-col justify-center py-24">
        <p className="hero-fade text-(length:--step-0) text-(--ink-2)">
          {job.title} at {job.company}
        </p>
        <h1
          id="hero-name"
          className="mt-4 font-(family-name:--font-display) text-(length:--step-4) leading-[0.88] font-extrabold tracking-[-0.035em]"
        >
          <span className="hero-line hero-yash">Yash</span>{" "}
          <span className="hero-line hero-nautiyal">Nautiyal</span>
        </h1>
        <p className="hero-fade mt-8 max-w-[34ch] text-(length:--step-1) leading-snug text-(--ink-2)">
          {config.description.short}
        </p>
        <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={config.resume}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-opacity hover:opacity-85"
          >
            Resume
          </a>
          <Link href="#projects" className="text-sm font-medium underline decoration-(--line) underline-offset-4 hover:decoration-(--ink)">
            See projects
          </Link>
          <Link href="#contact" className="text-sm font-medium underline decoration-(--line) underline-offset-4 hover:decoration-(--ink)">
            Contact
          </Link>
        </div>
      </div>
      <p className="hero-hint" aria-hidden>
        Scroll to unlock
      </p>
    </section>
  );
}
