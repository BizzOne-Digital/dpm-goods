"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import SmartImage from "@/components/ui/SmartImage";
import QuickShopModal from "@/components/shop/QuickShopModal";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn, discountPercent } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, price } = useI18n();
  const wishlist = useWishlist();
  const [quickOpen, setQuickOpen] = useState(false);
  const image = product.featuredImage || product.images[0];
  const hoverImage = product.images.find((img) => img !== image);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const saved = wishlist.has(product._id);

  const toggleWishlist = () => {
    const added = wishlist.toggle({ productId: product._id, slug: product.slug, name: product.name, image, price: product.price });
    toast.success(added ? t.product.addedWishlist : t.product.removedWishlist);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream">
        <Link href={`/shop/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <SmartImage
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
            className={cn("object-cover transition duration-700 group-hover:scale-105", hoverImage && "group-hover:opacity-0")}
          />
          {hoverImage && (
            <SmartImage
              src={hoverImage}
              alt=""
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
              className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.bestSeller && <span className="rounded bg-beige px-2 py-0.5 text-[10px] font-bold text-primary-dark">{t.product.bestseller}</span>}
          {!product.bestSeller && product.newArrival && <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold text-white">{t.product.new}</span>}
          {discount > 0 && <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-white">-{discount}% {t.product.off}</span>}
        </div>
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={`${saved ? t.product.removedWishlist : t.nav.wishlist}: ${product.name}`}
          aria-pressed={saved}
          className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:scale-105 hover:text-primary"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
        </button>
        {product.stock <= 0 && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded bg-white/90 py-1 text-center text-xs font-semibold text-muted">{t.product.outOfStock}</span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{product.category.replace(/-/g, " ")}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink">
          <Link href={`/shop/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-primary">{price(product.price)}</span>
          {discount > 0 && <span className="text-xs text-muted line-through">{price(product.compareAtPrice!)}</span>}
        </p>
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          disabled={product.stock <= 0}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {t.product.quickShop}
        </button>
      </div>
      {quickOpen && <QuickShopModal product={product} onClose={() => setQuickOpen(false)} />}
    </article>
  );
}
