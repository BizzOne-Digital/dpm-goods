import CategoryPage from "@/components/shop/CategoryPage";
import { CATEGORY_PAGES } from "@/lib/category-config";
import { buildMetadata } from "@/lib/seo";
import type { RawSearchParams } from "@/lib/shop-params";

const config = CATEGORY_PAGES["jeans"];

export const metadata = buildMetadata({
  title: "Jeans",
  description: `Shop ${config.tagline.charAt(0).toLowerCase()}${config.tagline.slice(1)} Fast shipping and easy returns at DPM Goods.`,
  path: config.path,
});

export default function Page({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <CategoryPage config={config} searchParams={searchParams} />;
}
