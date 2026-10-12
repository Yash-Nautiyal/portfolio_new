import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/data/config";
import { SmoothScroll } from "@/components/coldstart/smooth-scroll";
import { SignalField } from "@/components/coldstart/signal-field";
import { DevModeChip } from "@/components/coldstart/developer-mode";

const display = Funnel_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const sans = Funnel_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(config.site),
  title: {
    default: config.title,
    template: `%s | ${config.author}`,
  },
  description: config.description.short,
  openGraph: {
    title: config.title,
    description: config.description.short,
    url: config.site,
    siteName: config.author,
    images: [{ url: config.ogImg, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description.short,
    images: [config.ogImg],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('theme');const d=window.matchMedia('(prefers-color-scheme: dark)').matches;const dark=t==='dark'||(!t&&d);document.documentElement.classList.toggle('dark',dark);document.documentElement.setAttribute('data-theme',dark?'dark':'light');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('film');if(sessionStorage.getItem('coldstart-dev')==='1')document.documentElement.classList.add('dev-bounds')}catch(e){}",
          }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <SignalField />
        <DevModeChip />
        {children}
      </body>
    </html>
  );
}
