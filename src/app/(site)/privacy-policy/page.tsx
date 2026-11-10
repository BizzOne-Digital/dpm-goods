import LegalPage from "@/components/content/LegalPage";
import { getSection } from "@/lib/data";
import { sanitizeRichText } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Privacy Policy", description: "How DPM Goods collects, uses and protects your personal information.", path: "/privacy-policy" });

export default async function Page() {
  const section = await getSection("legal", "privacy-policy");
  return <LegalPage title={section?.title || "Privacy Policy"} html={sanitizeRichText(section?.description)} current="/privacy-policy" />;
}
