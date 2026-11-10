import Link from "next/link";
import ProductListing from "@/components/shop/ProductListing";
import SmartImage from "@/components/ui/SmartImage";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getCategories } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import type { ProductFilters } from "@/lib/data";
import type { RawSearchParams } from "@/lib/shop-params";

export type CategoryConfig = {
  path: string;
  categorySlug: string;
  title: string;
  tagline: string;
  preset: Partial<ProductFilters>;
  related: { label: string; href: string }[];
};

/** Editorial category landing: split hero with live category image + quick links, then the filtered grid. */
export default async function CategoryPage({ config, searchParams }: { config: CategoryConfig; searchParams: Promise<RawSearchParams> }) {
  const [{ t }, sp, categories] = await Promise.all([getDictionary(), searchParams, getCategories()]);
  const category = categories.find((c) => c.slug === config.categorySlug);

  return (
    <>
      <section className="bg-cream">
        <div className="container-x grid items-center gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:py-0">
          <div className="md:py-14">
            <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.shop, href: "/shop" }, { label: category?.name ?? config.title }]} />
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{category?.name ?? config.title}</h1>
            <p className="mt-3 max-w-lg text-base text-ink/75">{category?.description || config.tagline}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {config.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-56 overflow-hidden rounded-2xl md:h-80 md:rounded-none md:rounded-l-[2.5rem]">
            <SmartImage src={category?.image} alt={category?.name ?? config.title} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <ProductListing searchParams={sp} preset={config.preset} basePath={config.path} t={t} />
    </>
  );
}
