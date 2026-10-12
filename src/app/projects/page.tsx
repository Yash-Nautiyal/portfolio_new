import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectIndex } from "@/components/project/project-index";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies and product work across Flutter and Android.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pb-24">
        <Container>
          <PageHeader title="Projects" description="A curated collection of mobile apps and product engineering work." />
          <ProjectIndex />
        </Container>
      </main>
      <Footer />
    </>
  );
}
