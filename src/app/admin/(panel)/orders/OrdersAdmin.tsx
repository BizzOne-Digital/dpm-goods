"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Primitives";
import { Pager, SearchBox, TableSkeleton, usePagedList } from "@/components/admin/SimpleList";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type OrderRow = {
  _id: string;
  orderNumber: string;
  email: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  paymentProvider: string;
  items: { quantity: number }[];
  shippingAddress?: { firstName?: string; lastName?: string };
};

export default function OrdersAdmin() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const list = usePagedList<OrderRow>("/api/admin/orders", { status });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Orders</h1>
        <p className="text-sm text-muted">
          Review orders and move them through fulfillment. <span className="font-semibold text-ink">{list.total}</span> total.
        </p>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter by status">
        {["", ...ORDER_STATUSES].map((s) => (
          <button
            key={s || "all"}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => {
              list.setPage(() => 1);
              setStatus(s);
            }}
            className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize", status === s ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary")}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="card mb-4 p-3">
        <SearchBox placeholder="Search by order number, email or last name..." onSearch={(q) => { list.setPage(() => 1); list.setSearch(q); }} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.loading ? (
              <TableSkeleton cols={7} />
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center font-semibold">No orders yet.</td>
              </tr>
            ) : (
              list.items.map((o) => (
                <tr key={o._id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-mono text-xs font-bold text-primary hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</p>
                    <p className="text-xs text-muted">{o.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.items?.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="px-4 py-3 capitalize text-muted">{o.paymentProvider}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total, o.currency)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} pages={list.pages} setPage={list.setPage} />
    </div>
  );
}
