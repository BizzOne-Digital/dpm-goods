"use client";

import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pager, SearchBox, TableSkeleton, usePagedList } from "@/components/admin/SimpleList";
import { adminFetch } from "@/lib/admin/client";
import { formatDate } from "@/lib/utils";

type Subscriber = { _id: string; email: string; source?: string; active: boolean; createdAt: string };

export default function NewsletterPage() {
  const list = usePagedList<Subscriber>("/api/admin/newsletter");

  const remove = async (s: Subscriber) => {
    if (!window.confirm(`Remove ${s.email} from the newsletter list?`)) return;
    const res = await adminFetch(`/api/admin/newsletter?id=${s._id}`, { method: "DELETE" });
    if (!res.success) return toast.error(res.message);
    toast.success("Subscriber removed");
    list.reload();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Newsletter</h1>
          <p className="text-sm text-muted">
            Email subscribers from the website. <span className="font-semibold text-ink">{list.total}</span> total.
          </p>
        </div>
        <a href="/api/admin/newsletter?format=csv" download className="btn-outline">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>
      <div className="card mb-4 p-3">
        <SearchBox placeholder="Search email..." onSearch={(q) => { list.setPage(() => 1); list.setSearch(q); }} />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Subscribed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.loading ? (
              <TableSkeleton cols={4} />
            ) : list.items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-14 text-center font-semibold">No subscribers yet.</td></tr>
            ) : (
              list.items.map((s) => (
                <tr key={s._id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 capitalize text-muted">{s.source}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(s)} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50" aria-label={`Remove ${s.email}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
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
