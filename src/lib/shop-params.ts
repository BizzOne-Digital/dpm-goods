import type { ProductFilters, ProductSort } from "@/lib/data";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORTS: ProductSort[] = ["featured", "newest", "price-asc", "price-desc", "best-selling"];

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).map((s) => s.trim()).filter(Boolean).slice(0, 20);
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseShopParams(sp: RawSearchParams, preset: Partial<ProductFilters> = {}): ProductFilters {
  const sort = first(sp.sort) as ProductSort | undefined;
  return {
    q: first(sp.q)?.slice(0, 80) || undefined,
    category: preset.category ?? (first(sp.category) || undefined),
    gender: preset.gender ?? (first(sp.gender) || undefined),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    sizes: list(sp.size),
    colors: list(sp.color),
    inStock: first(sp.stock) === "1",
    sale: first(sp.sale) === "1",
    bestSeller: first(sp.best) === "1",
    newArrival: first(sp.new) === "1",
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    page: Math.max(1, Number(first(sp.page)) || 1),
    limit: 12,
  };
}
