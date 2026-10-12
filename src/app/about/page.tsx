import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { BuildNumber } from "@/components/coldstart/developer-mode";
import { config } from "@/data/config";
import { EXPERIENCE } from "@/data/experience";

export const metadata: Metadata = {
  title: "About",
  description: config.about.overview,
};

// Laid out like Android's Settings > About phone. "Build number" hides developer mode.
export default function AboutPage() {
  const job = EXPERIENCE[0];
  const { about } = config;
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-24">
        <Container>
          <PageHeader title="About" description={about.overview} />

          <section aria-labelledby="about-phone" className="max-w-3xl">
            <h2 id="about-phone" className="font-(family-name:--font-display) text-(length:--step-2) font-bold tracking-[-0.02em]">
              About phone
            </h2>
            <dl className="about-list">
              <div className="about-row">
                <dt>Device name</dt>
                <dd>{config.author}</dd>
              </div>
              <div className="about-row">
                <dt>Model</dt>
                <dd>{about.role}</dd>
              </div>
              <div className="about-row">
                <dt>Currently</dt>
                <dd>
                  {job.title} at {job.company}, since {job.startDate}
                </dd>
              </div>
              <div className="about-row">
                <dt>Education</dt>
                <dd>{about.education}</dd>
              </div>
              <div className="about-row">
                <dt>Based in</dt>
                <dd>{about.location}</dd>
              </div>
              <div className="about-row">
                <dt>Languages</dt>
                <dd>{about.languages}</dd>
              </div>
              <div className="about-row">
                <dt>State management</dt>
                <dd>{about.stateManagement}</dd>
              </div>
              <BuildNumber value="YN.2026.10" />
            </dl>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
