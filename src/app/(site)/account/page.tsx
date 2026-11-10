import Link from "next/link";
import { Heart, MapPin, Package, UserRound } from "lucide-react";
import OrdersTable from "@/components/account/OrdersTable";
import { EmptyState } from "@/components/ui/Primitives";
import { requireCustomerPage } from "@/lib/auth";
import { getAccountUser, getCustomerOrders } from "@/lib/account";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await requireCustomerPage();
  const [{ t }, user, orders] = await Promise.all([getDictionary(), getAccountUser(session.sub), getCustomerOrders(session.sub, 5)]);
  const active = orders.filter((o) => ["pending", "paid", "processing", "shipped"].includes(o.status)).length;

  const cards = [
    { href: "/account/orders", label: t.account.orders, value: orders.length, Icon: Package },
    { href: "/account/orders", label: "Active", value: active, Icon: Package },
    { href: "/account/addresses", label: t.account.addresses, value: user?.addresses.length ?? 0, Icon: MapPin },
    { href: "/account/profile", label: t.account.profile, value: "Edit", Icon: UserRound },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">
          {t.account.welcome}, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">Manage your orders, addresses and saved items.</p>
      </div>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ href, label, value, Icon }) => (
          <li key={label}>
            <Link href={href} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-2xl font-extrabold">{value}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{t.account.orders}</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-primary">
            {t.account.view}
          </Link>
        </div>
        {orders.length ? (
          <OrdersTable orders={orders} labels={{ date: t.account.orderDate, status: t.account.status, total: t.account.total, view: t.account.view }} />
        ) : (
          <EmptyState icon={Package} title={t.account.noOrders} actionText={t.nav.shop} actionHref="/shop" />
        )}
      </section>
      <Link href="/account/wishlist" className="card flex items-center justify-between p-5 hover:shadow-md">
        <span className="flex items-center gap-3 font-semibold">
          <Heart className="h-5 w-5 text-primary" aria-hidden="true" /> {t.account.wishlist}
        </span>
        <span className="text-sm text-primary">{t.account.view}</span>
      </Link>
    </div>
  );
}
