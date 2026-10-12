import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { ContactCtaSection } from "@/components/sections/contact-cta";
import { contactSectionMeta } from "@/data/section-metadata";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact me for jobs, contracts, and collaborations.",
};

// Same content as the homepage Contact section; outside the homepage stage the phones aren't shown.
export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-16">
        <Container>
          <PageHeader title={contactSectionMeta.title} description={contactSectionMeta.subtitle} />
          <ContactCtaSection asPage />
        </Container>
      </main>
      <Footer />
    </>
  );
}
