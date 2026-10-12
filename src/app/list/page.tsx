import type { Metadata } from "next";
import { ListView } from "@/components/list/ListView";

export const metadata: Metadata = { title: "Your emergency list – Bay Ready" };

export default function ListPage() {
  return <ListView />;
}
