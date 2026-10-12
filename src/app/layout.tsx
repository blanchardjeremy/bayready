import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Bay Ready: build your emergency kit list",
  description:
    "Answer a few questions and get a Bay Area emergency supply list sized for your household: a go bag, a stay-at-home bin, or both.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9eef0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1b26" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <header className="no-print">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <Mark />
              Bay Ready
            </Link>
            <nav className="flex gap-5 text-[0.95rem] text-ink-soft">
              <Link href="/list" className="hover:text-ink">
                My list
              </Link>
              <Link href="/about" className="hover:text-ink">
                Sources
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="no-print border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-soft sm:px-6">
            General preparedness guidance, not professional advice. In an emergency, call 911. Your
            answers stay in this browser.
          </div>
        </footer>
      </body>
    </html>
  );
}

function Mark() {
  // A tag with a grommet: the same shape used for kit sections.
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
      <path d="M6 0H22V16H6L0 8Z" fill="var(--orange)" />
      <circle cx="6.5" cy="8" r="2" fill="var(--fog)" />
    </svg>
  );
}
