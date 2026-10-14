import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteFooter, SiteHeader, SkipLink } from "@/components/SiteChrome";
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
    "Answer some short questions and get a Bay Area emergency supply list sized for your household: a go bag, a stay-at-home bin, or both.",
  // Added to the Home Screen, it opens like an app, titled Bay Ready.
  appleWebApp: { capable: true, title: "Bay Ready", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9eef0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1b26" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Extensions like LanguageTool add attributes to <html> before React loads.
    // This only ignores attribute differences on this one tag, not its children.
    <html lang="en" className={`${atkinson.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ServiceWorker />
      </body>
    </html>
  );
}
