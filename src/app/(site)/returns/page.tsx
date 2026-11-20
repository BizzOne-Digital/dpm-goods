import LegalPage from "@/components/content/LegalPage";
import { getSettings } from "@/lib/data";
import { textToHtml } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Returns & Exchanges",
  description: "How to return or exchange items purchased from Universal UPMGoods.",
  path: "/returns",
});

export default async function Page() {
  const s = await getSettings();
  const html =
    textToHtml(s.returnsText) +
    `<h2>How to start a return</h2><ol><li>Contact our support team with your order number.</li><li>Pack items unworn with original tags attached.</li><li>Ship the parcel using the instructions we send you.</li></ol><h2>Refunds</h2><p>Refunds are issued to the original payment method within 5-7 business days after we receive and inspect your return.</p>`;
  return <LegalPage title="Returns & Exchanges" html={html} current="/returns" />;
}
