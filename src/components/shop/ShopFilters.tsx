"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  sizes: string[];
  colors: string[];
  maxPrice: number;
  lockCategory?: boolean;
  lockGender?: boolean;
  total: number;
};

/** URL-driven filters: desktop sidebar + mobile drawer. */
export default function ShopFilters({ categories, sizes, colors, maxPrice, lockCategory, lockGender, total }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  // Re-sync inputs when the URL changes (back/forward, clear filters).
  const paramsKey = params.toString();
  const [lastParams, setLastParams] = useState(paramsKey);
  if (paramsKey !== lastParams) {
    setLastParams(paramsKey);
    setQ(params.get("q") ?? "");
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
  }

  const push = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  };

  const setParam = (key: string, value?: string) => push((p) => (value ? p.set(key, value) : p.delete(key)));

  const toggleList = (key: string, value: string) =>
    push((p) => {
      const current = (p.get(key) ?? "").split(",").filter(Boolean);
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const activeCount = ["q", "category", "gender", "min", "max", "size", "color", "stock", "sale", "best", "new"].filter((k) => params.get(k)).length;

  const clearAll = () => startTransition(() => router.push(pathname, { scroll: false }));

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    push((p) => {
      if (min) p.set("min", min);
      else p.delete("min");
      if (max) p.set("max", max);
      else p.delete("max");
    });
  };

  const group = "border-b border-line pb-5 mb-5 last:border-0";
  const heading = "mb-3 text-sm font-bold text-ink";

  const content = (
    <div>
      <form
        role="search"
        className={group}
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", q.trim() || undefined);
        }}
      >
        <label htmlFor="shop-search" className={heading + " block"}>
          {t.shop.search}
        </label>
        <div className="relative">
          <input id="shop-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.shop.search} className="input pr-10" />
          <button type="submit" className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-muted hover:text-primary" aria-label={t.nav.search}>
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {!lockCategory && (
        <fieldset className={group}>
          <legend className={heading}>{t.shop.category}</legend>
          <ul className="space-y-1">
            <li>
              <button type="button" onClick={() => setParam("category")} className={cn("w-full rounded px-2 py-1.5 text-left text-sm", !params.get("category") ? "bg-cream font-semibold text-primary" : "hover:bg-cream")}>
                {t.shop.allCategories}
              </button>
            </li>
            {categories.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => setParam("category", c.slug)}
                  aria-pressed={params.get("category") === c.slug}
                  className={cn("w-full rounded px-2 py-1.5 text-left text-sm", params.get("category") === c.slug ? "bg-cream font-semibold text-primary" : "hover:bg-cream")}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {!lockGender && (
        <fieldset className={group}>
          <legend className={heading}>{t.shop.gender}</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "", l: t.shop.all },
              { v: "men", l: t.shop.men },
              { v: "women", l: t.shop.women },
              { v: "unisex", l: t.shop.unisex },
            ].map((g) => (
              <button
                key={g.v}
                type="button"
                onClick={() => setParam("gender", g.v || undefined)}
                aria-pressed={(params.get("gender") ?? "") === g.v}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", (params.get("gender") ?? "") === g.v ? "border-primary bg-primary text-white" : "border-line hover:border-primary")}
              >
                {g.l}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <form className={group} onSubmit={applyPrice}>
        <p className={heading}>{t.shop.price}</p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="price-min">{t.shop.min}</label>
          <input id="price-min" type="number" inputMode="decimal" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder={`${t.shop.min} 0`} className="input" />
          <span className="text-muted">-</span>
          <label className="sr-only" htmlFor="price-max">{t.shop.max}</label>
          <input id="price-max" type="number" inputMode="decimal" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder={`${t.shop.max} ${maxPrice}`} className="input" />
        </div>
        <button type="submit" className="btn-outline mt-2 min-h-9 w-full text-xs">
          {t.shop.apply}
        </button>
      </form>

      {sizes.length > 0 && (
        <fieldset className={group}>
          <legend className={heading}>{t.shop.size}</legend>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const active = selected("size").includes(s);
              return (
                <button key={s} type="button" aria-pressed={active} onClick={() => toggleList("size", s)} className={cn("min-h-9 min-w-10 rounded-md border px-2 text-xs font-medium", active ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset className={group}>
          <legend className={heading}>{t.shop.color}</legend>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => {
              const active = selected("color").includes(c);
              return (
                <button key={c} type="button" aria-pressed={active} onClick={() => toggleList("color", c)} className={cn("rounded-full border px-3 py-1.5 text-xs", active ? "border-primary bg-primary text-white" : "border-line hover:border-primary")}>
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset className={group}>
        <legend className={heading}>{t.shop.availability}</legend>
        {[
          { key: "stock", label: t.shop.inStockOnly },
          { key: "sale", label: t.shop.onSale },
          { key: "new", label: t.nav.newArrivals },
          { key: "best", label: t.nav.bestSellers },
        ].map((o) => (
          <label key={o.key} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
            <input type="checkbox" checked={params.get(o.key) === "1"} onChange={(e) => setParam(o.key, e.target.checked ? "1" : undefined)} className="h-4 w-4 accent-[var(--primary)]" />
            {o.label}
          </label>
        ))}
      </fieldset>

      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="btn-ghost w-full text-primary">
          {t.product.clearFilters} ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="btn-outline min-h-10 px-4">
          <SlidersHorizontal className="h-4 w-4" />
          {t.shop.filters}
          {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-white">{activeCount}</span>}
        </button>
        {pending && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label={t.common.loading} />}
      </div>

      <aside className="hidden lg:block" aria-label={t.shop.filters}>
        <div className="sticky top-28">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-extrabold">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> {t.shop.filters}
            </h2>
            {pending && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label={t.common.loading} />}
          </div>
          {content}
        </div>
      </aside>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filters}>
            <button type="button" className="absolute inset-0 animate-fade-in bg-ink/50" onClick={() => setOpen(false)} aria-label={t.nav.close} />
            <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in flex-col bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-lg font-extrabold">{t.shop.filters}</h2>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream" aria-label={t.nav.close}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{content}</div>
              <div className="border-t border-line p-4">
                <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full">
                  {t.shop.showResults} ({total})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
