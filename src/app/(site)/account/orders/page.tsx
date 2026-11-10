import { Package } from "lucide-react";
import OrdersTable from "@/components/account/OrdersTable";
import { EmptyState } from "@/components/ui/Primitives";
import { requireCustomerPage } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/account";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await requireCustomerPage("/account/orders");
  const [{ t }, orders] = await Promise.all([getDictionary(), getCustomerOrders(session.sub)]);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">{t.account.orders}</h1>
      {orders.length ? (
        <OrdersTable orders={orders} labels={{ date: t.account.orderDate, status: t.account.status, total: t.account.total, view: t.account.view }} />
      ) : (
        <EmptyState icon={Package} title={t.account.noOrders} actionText={t.nav.shop} actionHref="/shop" />
      )}
    </div>
  );
}
