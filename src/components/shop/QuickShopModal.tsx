"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import AddToCartPanel from "@/components/shop/AddToCartPanel";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Product } from "@/types";

export default function QuickShopModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={product.name}>
      <button type="button" className="absolute inset-0 animate-fade-in bg-ink/55" aria-label={t.nav.close} onClick={onClose} />
      <div className="relative grid max-h-[92vh] w-full max-w-3xl animate-fade-up overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:grid-cols-2 sm:rounded-2xl">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow" aria-label={t.nav.close}>
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-[4/5] bg-cream sm:aspect-auto">
          <SmartImage src={product.featuredImage || product.images[0]} alt={product.name} fill sizes="(min-width: 640px) 384px, 100vw" className="object-cover" />
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="pr-8 text-xl font-extrabold">{product.name}</h2>
          {product.shortDescription && <p className="mt-2 text-sm text-muted">{product.shortDescription}</p>}
          <div className="mt-4">
            <AddToCartPanel product={product} compact onAdded={onClose} />
          </div>
          <Link href={`/shop/${product.slug}`} className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={onClose}>
            {t.product.viewDetails}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
