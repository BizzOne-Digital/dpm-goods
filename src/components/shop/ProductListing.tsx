import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import SortSelect from "@/components/shop/SortSelect";
import { EmptyState } from "@/components/ui/Primitives";
import { getCategories, getProductFacets, getProducts, type ProductFilters } from "@/lib/data";
import { parseShopParams, type RawSearchParams } from "@/lib/shop-params";
import type { Dictionary } from "@/lib/i18n/config";

function pageHref(basePath: string, sp: RawSearchParams, page: number) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v == null) continue;
    next.set(k, Array.isArray(v) ? v.join(",") : v);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

/** Shared listing for /shop and the category routes (/men, /sneakers, ...). */
export default async function ProductListing({
  searchParams,
  preset = {},
  basePath,
  t,
}: {
  searchParams: RawSearchParams;
  preset?: Partial<ProductFilters>;
  basePath: string;
  t: Dictionary;
}) {
  const filters = parseShopParams(searchParams, preset);
  const [{ items, total }, categories, facets] = await Promise.all([getProducts(filters), getCategories(), getProductFacets()]);
  const page = filters.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / (filters.limit ?? 12)));

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[250px_1fr] lg:py-12">
      <Suspense fallback={null}>
        <ShopFilters
          categories={categories}
          sizes={facets.sizes}
          colors={facets.colors}
          maxPrice={facets.maxPrice}
          lockCategory={Boolean(preset.category)}
          lockGender={Boolean(preset.gender)}
          total={total}
        />
      </Suspense>

      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-bold text-ink">{total}</span> {t.shop.results}
            {filters.q && (
              <>
                {" "}
                for &ldquo;<span className="font-semibold text-ink">{filters.q}</span>&rdquo;
              </>
            )}
          </p>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        {items.length === 0 ? (
          <EmptyState title={t.product.noProducts} description={t.product.noProductsHint} actionText={t.product.clearFilters} actionHref={basePath} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 4} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
            {page > 1 && (
              <Link href={pageHref(basePath, searchParams, page - 1)} className="btn-outline min-h-10 px-3" aria-label={t.shop.previous}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            {Array.from({ length: pages }).map((_, i) => (
              <Link
                key={i}
                href={pageHref(basePath, searchParams, i + 1)}
                aria-current={page === i + 1 ? "page" : undefined}
                className={page === i + 1 ? "btn-primary min-h-10 px-4" : "btn-outline min-h-10 px-4"}
              >
                {i + 1}
              </Link>
            ))}
            {page < pages && (
              <Link href={pageHref(basePath, searchParams, page + 1)} className="btn-outline min-h-10 px-3" aria-label={t.shop.next}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
