import type { Metadata } from "next";
import { pages } from "@/i18n/en/pages";
import { AboutContent } from "./AboutContent";

// Built in English. AboutContent updates the tab title for Spanish visitors.
export const metadata: Metadata = { title: pages.about.title };

export default function AboutPage() {
  return <AboutContent />;
}
