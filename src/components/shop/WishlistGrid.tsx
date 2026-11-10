"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { EmptyState, Skeleton } from "@/components/ui/Primitives";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function WishlistGrid() {
  const { items, ready, remove } = useWishlist();
  const { t, price } = useI18n();

  if (!ready) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState icon={Heart} title="Your wishlist is empty." description="Tap the heart on any product to save it for later." actionText={t.cart.continue} actionHref="/shop" />;
  }

  return (
    <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.productId} className="group">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream">
            <Link href={`/shop/${item.slug}`} aria-label={item.name}>
              <SmartImage src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </Link>
            <button type="button" onClick={() => remove(item.productId)} className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow hover:text-red-600" aria-label={`${t.cart.remove} ${item.name}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-3 line-clamp-1 text-sm font-semibold">
            <Link href={`/shop/${item.slug}`} className="hover:text-primary">{item.name}</Link>
          </h2>
          <p className="text-sm font-bold text-primary">{price(item.price)}</p>
          <Link href={`/shop/${item.slug}`} className="btn-outline mt-2 min-h-10 w-full text-xs">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> {t.product.addToCart}
          </Link>
        </li>
      ))}
    </ul>
  );
}
