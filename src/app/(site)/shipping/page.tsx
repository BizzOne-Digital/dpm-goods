import LegalPage from "@/components/content/LegalPage";
import { getSettings } from "@/lib/data";
import { textToHtml } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Shipping & Delivery",
  description: "Processing times, delivery estimates and shipping rates for DPM Goods orders.",
  path: "/shipping",
});

export default async function Page() {
  const s = await getSettings();
  const html =
    textToHtml(s.shippingText) +
    `<h2>Rates</h2><ul><li>Standard shipping: ${formatPrice(s.flatShippingRate, s.currency)}</li>` +
    (s.freeShippingThreshold ? `<li>Free standard shipping on orders over ${formatPrice(s.freeShippingThreshold, s.currency)}</li>` : "") +
    `</ul><h2>Tracking</h2><p>Once your order ships you will receive an email with tracking details. Signed-in customers can also follow order status from their account.</p>`;
  return <LegalPage title="Shipping & Delivery" html={html} current="/shipping" />;
}
