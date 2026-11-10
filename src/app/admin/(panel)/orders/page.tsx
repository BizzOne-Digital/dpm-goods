import { Suspense } from "react";
import OrdersAdmin from "./OrdersAdmin";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersAdmin />
    </Suspense>
  );
}
