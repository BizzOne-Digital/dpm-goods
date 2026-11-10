"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/client";

/** Shared paginated fetch + search state for custom admin tables. */
export function usePagedList<T>(endpoint: string, extra: Record<string, string> = {}) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const extraKey = JSON.stringify(extra);

  const reload = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(JSON.parse(extraKey) as Record<string, string>) });
    if (search) params.set("q", search);
    for (const [k, v] of [...params.entries()]) if (!v) params.delete(k);
    const res = await adminFetch<{ items: T[]; total: number; pages: number }>(`${endpoint}?${params}`);
    if (res.success) {
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } else toast.error(res.message);
    setLoading(false);
  }, [endpoint, page, search, extraKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data from the admin API when filters change
    reload();
  }, [reload]);

  return { items, setItems, total, pages, page, setPage, search, setSearch, loading, reload };
}

export function SearchBox({ placeholder, onSearch }: { placeholder: string; onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="relative min-w-52 flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q.trim());
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="input pl-9" aria-label="Search" />
    </form>
  );
}

export function Pager({ page, pages, setPage }: { page: number; pages: number; setPage: (fn: (p: number) => number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline min-h-9 px-3">Previous</button>
      <span className="text-muted">Page {page} of {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline min-h-9 px-3">Next</button>
    </div>
  );
}

export function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={cols} className="px-4 py-3">
            <div className="skeleton h-9 w-full" />
          </td>
        </tr>
      ))}
    </>
  );
}
