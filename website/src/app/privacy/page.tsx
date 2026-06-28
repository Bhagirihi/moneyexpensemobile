import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacySections } from "@/lib/legal";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description: `How ${site.name} collects, uses, and protects your data.`,
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={privacySections} />;
}
