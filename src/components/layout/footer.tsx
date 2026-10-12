import Link from "next/link";
import { SocialLinks } from "@/components/shared/social-links";
import { config } from "@/data/config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-(--line) py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 text-sm text-(--ink-2) sm:flex-row">
        <p>
          © {year} {config.author}. All rights reserved.
        </p>
        <nav aria-label="Pages" className="flex items-center gap-4">
          <Link href="/projects" className="hover:text-(--ink)">
            All projects
          </Link>
          <Link href="/about" className="hover:text-(--ink)">
            About
          </Link>
        </nav>
        <SocialLinks />
      </div>
    </footer>
  );
}
