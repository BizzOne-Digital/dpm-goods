"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import OrderStatusTracker from "@/components/account/OrderStatusTracker";
import { Skeleton, StatusBadge } from "@/components/ui/Primitives";
import { adminFetch } from "@/lib/admin/client";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

type AdminOrder = Order & { user?: { name: string; email: string } | null; paymentReference?: string };

const NEXT_STEP: Record<string, string> = { pending: "paid", paid: "processing", processing: "shipped", shipped: "delivered" };

export default function OrderDetailAdmin({ id }: { id: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<{ item: AdminOrder }>(`/api/admin/orders/${id}`).then((res) => {
      if (!res.success) return toast.error(res.message);
      setOrder(res.item);
      setStatus(res.item.status);
      setTracking(res.item.trackingNumber ?? "");
      setNotes(res.item.notes ?? "");
    });
  }, [id]);

  const save = async (override?: string) => {
    const nextStatus = override ?? status;
    if (["cancelled", "refunded"].includes(nextStatus) && nextStatus !== order?.status && !window.confirm(`Mark this order as ${nextStatus}? Items will be returned to stock.`)) return;
    setSaving(true);
    const res = await adminFetch<{ item: AdminOrder }>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus, trackingNumber: tracking, notes, note: note || undefined }),
    });
    setSaving(false);
    if (!res.success) return toast.error(res.message);
    setOrder((o) => (o ? { ...o, ...res.item, user: o.user } : o));
    setStatus(res.item.status);
    setNote("");
    toast.success("Order updated");
  };

  if (!order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const money = (n: number) => formatPrice(n, order.currency);
  const a = order.shippingAddress ?? {};
  const next = NEXT_STEP[order.status];

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-extrabold">{order.orderNumber}</h1>
          <p className="text-sm text-muted">Placed {formatDate(order.createdAt)} · {order.paymentProvider} payment</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {next && (
            <button type="button" disabled={saving} onClick={() => save(next)} className="btn-primary min-h-9 text-xs capitalize">
              Mark as {next}
            </button>
          )}
        </div>
      </div>

      <section className="card p-5">
        <OrderStatusTracker status={order.status} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-bold">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-cream">
                    <SmartImage src={item.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">{[item.sku, item.size, item.color].filter(Boolean).join(" · ")} · {item.quantity} x {money(item.unitPrice)}</p>
                  </div>
                  <span className="font-semibold">{money(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount {order.promoCode}</dt><dd>-{money(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{money(order.shipping)}</dd></div>
              {order.tax > 0 && <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{money(order.tax)}</dd></div>}
              <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 font-bold">Status history</h2>
            <ol className="space-y-3 border-l-2 border-line pl-4">
              {[...(order.statusHistory ?? [])].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
                  <p className="text-sm font-semibold capitalize">{h.status}</p>
                  <p className="text-xs text-muted">{new Date(h.at).toLocaleString()} {h.note ? `· ${h.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h2 className="font-bold">Update order</h2>
            <div>
              <label htmlFor="o-status" className="label">Status</label>
              <select id="o-status" value={status} onChange={(e) => setStatus(e.target.value)} className="input capitalize">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="o-tracking" className="label">Tracking number</label>
              <input id="o-tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} className="input" placeholder="Carrier tracking number" />
            </div>
            <div>
              <label htmlFor="o-note" className="label">Status note (shown in history)</label>
              <input id="o-note" value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="e.g. Shipped via UPS" />
            </div>
            <div>
              <label htmlFor="o-notes" className="label">Internal notes</label>
              <textarea id="o-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
            </div>
            <button type="button" disabled={saving} onClick={() => save()} className="btn-primary w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          </section>

          <section className="card p-5 text-sm">
            <h2 className="mb-2 font-bold">Customer</h2>
            <p className="font-medium">{a.firstName} {a.lastName}</p>
            <p><a href={`mailto:${order.email}`} className="text-primary hover:underline">{order.email}</a></p>
            {order.phone && <p>{order.phone}</p>}
            <p className="mt-1 text-xs text-muted">{order.user ? "Registered customer" : "Guest checkout"}</p>
            <h3 className="mb-1 mt-4 font-bold">Ship to</h3>
            <address className="not-italic leading-relaxed text-ink/80">
              {a.address}{a.apartment ? `, ${a.apartment}` : ""}<br />
              {a.city}, {a.state} {a.zip}<br />
              {a.country}
            </address>
            {order.paymentReference && <p className="mt-3 break-all text-xs text-muted">Payment ref: {order.paymentReference}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
