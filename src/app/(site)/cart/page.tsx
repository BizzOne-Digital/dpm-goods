import { buildMetadata } from "@/lib/seo";
import CartView from "./CartView";

export const metadata = buildMetadata({ title: "Your Cart", path: "/cart", noIndex: true });

export default function CartPage() {
  return <CartView />;
}
