import { buildMetadata } from "@/lib/seo";
import CheckoutView from "./CheckoutView";

export const metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return <CheckoutView />;
}
