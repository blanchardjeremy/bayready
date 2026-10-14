import type { Metadata } from "next";
import { pages } from "@/i18n/en/pages";
import { SignContent } from "./SignContent";

// Built in English. SignContent updates the tab title for Spanish visitors.
export const metadata: Metadata = { title: pages.sign.title };

export default function SignPage() {
  return <SignContent />;
}
