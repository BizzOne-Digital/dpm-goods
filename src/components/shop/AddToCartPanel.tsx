"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import QuantityControl from "@/components/shop/QuantityControl";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn, discountPercent } from "@/lib/utils";
import type { Product } from "@/types";

/** Price, size/color selectors, quantity and Add to Cart / Buy Now. */
export default function AddToCartPanel({
  product,
  compact = false,
  onAdded,
}: {
  product: Product;
  compact?: boolean;
  onAdded?: () => void;
}) {
  const { t, price } = useI18n();
  const { addItem, setDrawerOpen } = useCart();
  const wishlist = useWishlist();
  const router = useRouter();
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;
  const image = product.featuredImage || product.images[0];
  const saved = wishlist.has(product._id);

  const add = (buyNow = false) => {
    if (product.sizes.length && !size) {
      setError(t.product.selectSize);
      return false;
    }
    if (product.colors.length && !color) {
      setError(t.product.selectColor);
      return false;
    }
    setError("");
    addItem({ productId: product._id, slug: product.slug, name: product.name, image, price: product.price, size: size || undefined, color: color || undefined }, qty);
    if (buyNow) {
      setDrawerOpen(false);
      router.push("/checkout");
    } else {
      toast.success(`${t.product.added}: ${product.name}`);
    }
    onAdded?.();
    return true;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("font-extrabold text-primary", compact ? "text-2xl" : "text-3xl")}>{price(product.price)}</span>
        {discount > 0 && (
          <>
            <span className="text-lg text-muted line-through">{price(product.compareAtPrice!)}</span>
            <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-white">
              -{discount}% {t.product.off}
            </span>
          </>
        )}
      </div>

      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {t.product.color}: <span className="font-normal text-muted">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                className={cn("min-h-10 rounded-md border px-3.5 text-sm transition", color === c ? "border-primary bg-primary text-white" : "border-line hover:border-primary")}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {t.product.size}: <span className="font-normal text-muted">{size}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
                aria-pressed={size === s}
                className={cn("grid h-11 min-w-11 place-items-center rounded-md border px-3 text-sm font-medium transition", size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityControl value={qty} onChange={(v) => setQty(Math.max(1, Math.min(v, Math.max(product.stock, 1))))} max={Math.max(product.stock, 1)} />
        <button type="button" disabled={outOfStock} onClick={() => add(false)} className="btn-primary h-11 flex-1">
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {outOfStock ? t.product.outOfStock : t.product.addToCart}
        </button>
        {!compact && (
          <button
            type="button"
            onClick={() => {
              const added = wishlist.toggle({ productId: product._id, slug: product.slug, name: product.name, image, price: product.price });
              toast.success(added ? t.product.addedWishlist : t.product.removedWishlist);
            }}
            aria-pressed={saved}
            aria-label={t.nav.wishlist}
            className="grid h-11 w-11 place-items-center rounded-md border border-line transition hover:border-primary hover:text-primary"
          >
            <Heart className={cn("h-5 w-5", saved && "fill-primary text-primary")} />
          </button>
        )}
      </div>
      {!compact && (
        <button type="button" disabled={outOfStock} onClick={() => add(true)} className="btn-dark h-12 w-full">
          <Zap className="h-4 w-4" aria-hidden="true" />
          {t.product.buyNow}
        </button>
      )}
    </div>
  );
}
