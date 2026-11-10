import ProductListing from "@/components/shop/ProductListing";
import { PageHero } from "@/components/ui/Primitives";
import { IMG } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import type { RawSearchParams } from "@/lib/shop-params";

export const metadata = buildMetadata({
  title: "Shop All Fashion",
  description: "Browse men's and women's clothing, sneakers, jeans, dresses and accessories at DPM Goods. Filter by size, color, price and more.",
  path: "/shop",
});

export default async function ShopPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const [{ t }, sp] = await Promise.all([getDictionary(), searchParams]);
  return (
    <>
      <PageHero
        eyebrow="DPM Goods"
        title={t.shop.title}
        description={t.shop.subtitle}
        image={IMG.denimWall}
        breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.shop }]}
      />
      <ProductListing searchParams={sp} basePath="/shop" t={t} />
    </>
  );
}
