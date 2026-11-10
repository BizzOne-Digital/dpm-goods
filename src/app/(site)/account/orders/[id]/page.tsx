import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OrderStatusTracker from "@/components/account/OrderStatusTracker";
import SmartImage from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/Primitives";
import { requireCustomerPage } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/account";
import { getDictionary } from "@/lib/i18n/server";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Order Details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCustomerPage(`/account/orders/${id}`);
  const [{ t }, order] = await Promise.all([getDictionary(), getCustomerOrder(session.sub, id)]);
  if (!order) notFound();
  const money = (n: number) => formatPrice(n, order.currency);
  const a = order.shippingAddress ?? {};

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.account.orders}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-extrabold">{order.orderNumber}</h1>
          <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="card p-6" aria-label={t.account.track}>
        <h2 className="mb-5 font-bold">{t.account.track}</h2>
        <OrderStatusTracker status={order.status} />
        {order.trackingNumber && (
          <p className="mt-5 text-sm">
            Tracking number: <span className="font-mono font-semibold">{order.trackingNumber}</span>
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6">
          <h2 className="mb-2 font-bold">Items</h2>
          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-cream">
                  <SmartImage src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${item.slug}`} className="font-semibold hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {[item.size, item.color].filter(Boolean).join(" / ")} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">{money(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-6">
          <section className="card space-y-2 p-6 text-sm">
            <h2 className="mb-2 font-bold">{t.checkout.summary}</h2>
            <p className="flex justify-between">
              <span className="text-muted">{t.cart.subtotal}</span>
              {money(order.subtotal)}
            </p>
            {order.discount > 0 && (
              <p className="flex justify-between text-emerald-700">
                <span>
                  {t.cart.discount} {order.promoCode}
                </span>
                -{money(order.discount)}
              </p>
            )}
            <p className="flex justify-between">
              <span className="text-muted">{t.cart.shipping}</span>
              {order.shipping ? money(order.shipping) : t.cart.free}
            </p>
            {order.tax > 0 && (
              <p className="flex justify-between">
                <span className="text-muted">{t.cart.taxes}</span>
                {money(order.tax)}
              </p>
            )}
            <p className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <span>{t.cart.total}</span>
              {money(order.total)}
            </p>
          </section>
          <section className="card p-6 text-sm">
            <h2 className="mb-2 font-bold">{t.checkout.shipping}</h2>
            <address className="not-italic leading-relaxed text-ink/80">
              {a.firstName} {a.lastName}
              <br />
              {a.address}
              {a.apartment ? `, ${a.apartment}` : ""}
              <br />
              {a.city}, {a.state} {a.zip}
              <br />
              {a.country}
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
