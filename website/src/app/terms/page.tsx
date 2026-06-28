import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { termsSections } from "@/lib/legal";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Terms of Service — ${site.name}`,
  description: `Terms of Service for the ${site.name} mobile app and website.`,
};

export default function TermsPage() {
  return <LegalPage title="Terms of Service" sections={termsSections} />;
}
