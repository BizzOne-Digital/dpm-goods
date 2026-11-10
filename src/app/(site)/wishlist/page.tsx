import WishlistGrid from "@/components/shop/WishlistGrid";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Wishlist", path: "/wishlist", noIndex: true });

export default async function WishlistPage() {
  const { t } = await getDictionary();
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.wishlist }]} />
      <h1 className="mb-8 mt-4 text-3xl font-extrabold sm:text-4xl">{t.nav.wishlist}</h1>
      <WishlistGrid />
    </div>
  );
}
