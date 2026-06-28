import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { adsSections } from "@/lib/legal";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Advertising Policy — ${site.name}`,
  description: `How advertising works on the ${site.name} Free plan, including AdMob, ad types, and your choices.`,
};

export default function AdsPolicyPage() {
  return <LegalPage title="Advertising Policy" sections={adsSections} />;
}
