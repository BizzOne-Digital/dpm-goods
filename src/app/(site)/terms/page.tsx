import LegalPage from "@/components/content/LegalPage";
import { getSection } from "@/lib/data";
import { sanitizeRichText } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Terms & Conditions", description: "The terms that apply when you shop at Universal UPMGoods.", path: "/terms" });

export default async function Page() {
  const section = await getSection("legal", "terms");
  return <LegalPage title={section?.title || "Terms & Conditions"} html={sanitizeRichText(section?.description)} current="/terms" />;
}
