import Image from "next/image";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeader } from "@/components/layout/section-header";
import { CopyEmail } from "@/components/coldstart/copy-email";
import { contactSectionMeta } from "@/data/section-metadata";
import { config } from "@/data/config";

const LABELS: Record<string, string> = { gmail: "Gmail", linkedin: "LinkedIn", github: "GitHub" };

// Contact: the address is the headline, socials sit in an Android-style share sheet,
// and the form mirrors into the phone's compose screen while you type (stage.tsx).
/** `asPage`: on /contact the page header supplies the h1, so the section skips its own intro. */
export function ContactCtaSection({ asPage = false }: { asPage?: boolean }) {
  const Sub = asPage ? "h2" : "h3"; // keeps heading levels sequential on /contact
  return (
    <section id="contact" className="scroll-mt-16 py-14 sm:py-20">
      {asPage ? null : (
        <SectionHeader
          label={contactSectionMeta.label}
          title={contactSectionMeta.title}
          subtitle={contactSectionMeta.subtitle}
        />
      )}

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <a
          href={`mailto:${config.email}`}
          className="contact-email font-(family-name:--font-display) text-[clamp(1.375rem,5.6vw,2.25rem)] font-bold tracking-[-0.02em] [overflow-wrap:anywhere] underline decoration-(--line) decoration-2 underline-offset-[0.2em] hover:decoration-(--ink)"
        >
          {config.email}
        </a>
        <CopyEmail email={config.email} />
      </div>

      <div className="share-sheet mt-10">
        <Sub className="text-(length:--step--1) font-medium text-(--ink-2)">Or find me on</Sub>
        <ul className="mt-4 flex gap-6">
          {Object.entries(config.social).map(([key, value]) => (
            <li key={key}>
              <a
                href={value.link}
                target={key === "gmail" ? undefined : "_blank"}
                rel={key === "gmail" ? undefined : "noreferrer"}
                className="share-target"
              >
                <span className="share-target-icon">
                  <Image src={value.img} alt="" width={28} height={28} />
                </span>
                {LABELS[key] ?? key}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 max-w-xl lg:max-w-md">
        <Sub className="mb-6 font-(family-name:--font-display) text-(length:--step-2) font-bold tracking-[-0.02em]">
          Send a message
        </Sub>
        <ContactForm />
      </div>
    </section>
  );
}
