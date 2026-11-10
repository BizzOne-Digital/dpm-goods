import WishlistGrid from "@/components/shop/WishlistGrid";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Wishlist" };

export default async function AccountWishlistPage() {
  const { t } = await getDictionary();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">{t.account.wishlist}</h1>
      <WishlistGrid />
    </div>
  );
}
