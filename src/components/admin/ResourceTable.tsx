"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, ExternalLink, Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/Primitives";
import { adminFetch } from "@/lib/admin/client";
import { getResource, type ColumnDef } from "@/lib/admin/resources";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type Row = Record<string, unknown> & { _id: string };

export default function ResourceTable({ resourceKey }: { resourceKey: string }) {
  const config = getResource(resourceKey);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: config?.sortable ? "200" : "20" });
    if (search) params.set("q", search);
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    const res = await adminFetch<{ items: Row[]; total: number; pages: number }>(`/api/admin/${resourceKey}?${params}`);
    if (res.success) {
      setRows(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } else toast.error(res.message);
    setLoading(false);
  }, [resourceKey, page, search, filters, config?.sortable]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data from the admin API when filters change
    load();
  }, [load]);

  if (!config) return <p className="text-sm text-red-600">Unknown section.</p>;

  const patch = async (row: Row, data: Record<string, unknown>, message = "Updated") => {
    setBusy(row._id);
    const res = await adminFetch<{ item: Row }>(`/api/admin/${resourceKey}/${row._id}`, { method: "PATCH", body: JSON.stringify(data) });
    setBusy(null);
    if (!res.success) return toast.error(res.message);
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, ...res.item } : r)));
    toast.success(message);
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    setBusy(row._id);
    const res = await adminFetch(`/api/admin/${resourceKey}/${row._id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.success) return toast.error(res.message);
    toast.success(`${config.singular} deleted`);
    load();
  };

  const duplicate = async (row: Row) => {
    setBusy(row._id);
    const res = await adminFetch(`/api/admin/${resourceKey}/${row._id}/duplicate`, { method: "POST" });
    setBusy(null);
    if (!res.success) return toast.error(res.message);
    toast.success("Duplicated as a draft");
    load();
  };

  /** Swap sortOrder with the neighbour and persist both. */
  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const withOrder = next.map((r, i) => ({ ...r, sortOrder: i + 1 }));
    setRows(withOrder);
    const changed = withOrder.filter((r, i) => r.sortOrder !== rows[i]?.sortOrder || r._id !== rows[i]?._id);
    const results = await Promise.all(changed.map((r) => adminFetch(`/api/admin/${resourceKey}/${r._id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: r.sortOrder }) })));
    if (results.some((r) => !r.success)) {
      toast.error("Could not save the new order");
      load();
    } else toast.success("Order updated");
  };

  const cell = (row: Row, col: ColumnDef) => {
    const v = row[col.name];
    switch (col.kind) {
      case "image":
        return (
          <span className="relative block h-12 w-12 overflow-hidden rounded-md bg-cream ring-1 ring-line">
            {v ? <SmartImage src={v as string} alt="" fill sizes="48px" className="object-cover" /> : null}
          </span>
        );
      case "boolean":
        return (
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(v)}
            aria-label={`${col.label}: ${v ? "on" : "off"}`}
            disabled={busy === row._id}
            onClick={() => patch(row, { [col.name]: !v }, `${col.label} ${v ? "off" : "on"}`)}
            className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition", v ? "bg-primary" : "bg-beige")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", v ? "left-[22px]" : "left-0.5")} />
          </button>
        );
      case "status":
        return <StatusBadge status={String(v ?? "")} />;
      case "price":
        return <span className="font-semibold">{formatPrice(Number(v ?? 0))}</span>;
      case "date":
        return <span className="whitespace-nowrap text-muted">{formatDate(v as string)}</span>;
      case "rating":
        return (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {String(v ?? "")}
          </span>
        );
      default: {
        const text = Array.isArray(v) ? v.join(", ") : String(v ?? "");
        const lowStock = col.name === "stock" && Number(v) <= 5;
        return <span className={cn("line-clamp-2 max-w-xs", lowStock && "font-semibold text-red-600")}>{text || "-"}</span>;
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{config.label}</h1>
          <p className="text-sm text-muted">
            {config.description} <span className="font-semibold text-ink">{total}</span> total.
          </p>
        </div>
        {config.canCreate && (
          <Link href={`/admin/${resourceKey}/new`} className="btn-primary">
            <Plus className="h-4 w-4" /> New {config.singular}
          </Link>
        )}
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <form
          className="relative min-w-52 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(q.trim());
          }}
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${config.label.toLowerCase()}...`} className="input pl-9" aria-label="Search" />
        </form>
        {config.filters?.map((f) => (
          <select
            key={f.name}
            value={filters[f.name] ?? ""}
            onChange={(e) => {
              setPage(1);
              setFilters((s) => ({ ...s, [f.name]: e.target.value }));
            }}
            className="input w-auto"
            aria-label={f.label}
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              {config.sortable && <th className="w-16 px-3 py-3 font-semibold">Order</th>}
              {config.columns.map((c) => (
                <th key={c.name} className="px-3 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={config.columns.length + 2} className="px-3 py-3">
                    <div className="skeleton h-10 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 2} className="px-3 py-14 text-center">
                  <p className="font-semibold">{config.emptyText}</p>
                  {config.canCreate && (
                    <Link href={`/admin/${resourceKey}/new`} className="btn-primary mt-4">
                      <Plus className="h-4 w-4" /> Add your first {config.singular.toLowerCase()}
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const preview = config.previewPath?.(row);
                return (
                  <tr key={row._id} className={cn("transition hover:bg-cream/40", busy === row._id && "opacity-60")}>
                    {config.sortable && (
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <button type="button" onClick={() => reorder(index, -1)} disabled={index === 0} className="grid h-6 w-6 place-items-center rounded hover:bg-cream disabled:opacity-30" aria-label="Move up">
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => reorder(index, 1)} disabled={index === rows.length - 1} className="grid h-6 w-6 place-items-center rounded hover:bg-cream disabled:opacity-30" aria-label="Move down">
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                    {config.columns.map((c, ci) => (
                      <td key={c.name} className="px-3 py-2.5 align-middle">
                        {ci === 1 || (ci === 0 && c.kind !== "image") ? (
                          <Link href={`/admin/${resourceKey}/${row._id}/edit`} className="font-semibold hover:text-primary">
                            {cell(row, c)}
                          </Link>
                        ) : (
                          cell(row, c)
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {config.quickActions?.map((a) => (
                          <button
                            key={a.label}
                            type="button"
                            disabled={busy === row._id}
                            onClick={() => patch(row, a.patch, a.label)}
                            className={cn(
                              "hidden rounded-md px-2 py-1 text-xs font-semibold xl:inline-block",
                              a.tone === "danger" ? "text-red-700 hover:bg-red-50" : a.tone === "primary" ? "text-primary hover:bg-cream" : "text-ink hover:bg-cream"
                            )}
                          >
                            {a.label}
                          </button>
                        ))}
                        {preview && (
                          <a href={preview} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="View on site" title="View on site">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {config.canDuplicate && (
                          <button type="button" onClick={() => duplicate(row)} className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="Duplicate" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                        <Link href={`/admin/${resourceKey}/${row._id}/edit`} className="grid h-8 w-8 place-items-center rounded hover:bg-cream" aria-label="Edit" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button type="button" onClick={() => remove(row)} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50" aria-label="Delete" title="Delete">
                          {busy === row._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && !config.sortable && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline min-h-9 px-3">
            Previous
          </button>
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline min-h-9 px-3">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
