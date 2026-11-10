import Link from "next/link";
import { StatusBadge } from "@/components/ui/Primitives";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrdersTable({ orders, labels }: { orders: Order[]; labels: { date: string; status: string; total: string; view: string } }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">{labels.date}</th>
            <th className="px-4 py-3 font-semibold">{labels.status}</th>
            <th className="px-4 py-3 text-right font-semibold">{labels.total}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o._id} className="hover:bg-cream/40">
              <td className="px-4 py-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
              <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total, o.currency)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/account/orders/${o._id}`} className="font-semibold text-primary hover:underline">{labels.view}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
