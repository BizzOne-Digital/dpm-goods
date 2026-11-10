"use client";

import { Pager, SearchBox, TableSkeleton, usePagedList } from "@/components/admin/SimpleList";
import { formatDate, formatPrice } from "@/lib/utils";

type Customer = { _id: string; name: string; email: string; phone?: string; createdAt: string; orders: number; spent: number; active: boolean };

export default function CustomersPage() {
  const list = usePagedList<Customer>("/api/admin/customers");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Customers</h1>
        <p className="text-sm text-muted">
          Registered accounts with order history. <span className="font-semibold text-ink">{list.total}</span> total.
        </p>
      </div>
      <div className="card mb-4 p-3">
        <SearchBox placeholder="Search name, email or phone..." onSearch={(q) => { list.setPage(() => 1); list.setSearch(q); }} />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 text-right font-semibold">Orders</th>
              <th className="px-4 py-3 text-right font-semibold">Lifetime spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.loading ? (
              <TableSkeleton cols={5} />
            ) : list.items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-14 text-center font-semibold">No customers yet.</td></tr>
            ) : (
              list.items.map((c) => (
                <tr key={c._id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline">{c.email}</a>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.phone || "-"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(c.spent)}</td>
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
