"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type Tab = "all" | "men" | "women" | "sneakers" | "new";

export default function BestSellersTabs({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("all");

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t.home.tabAll },
    { key: "men", label: t.nav.men },
    { key: "women", label: t.nav.women },
    { key: "sneakers", label: t.nav.sneakers },
    { key: "new", label: t.home.tabNew },
  ];

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      switch (tab) {
        case "men": return p.gender === "men" || p.gender === "unisex";
        case "women": return p.gender === "women" || p.gender === "unisex";
        case "sneakers": return p.category === "sneakers";
        case "new": return p.newArrival;
        default: return p.bestSeller;
      }
    });
    return (list.length ? list : products).slice(0, 5);
  }, [products, tab]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t.home.bestSellers}</h2>
          <span className="hidden h-px w-12 bg-ink/70 sm:block" />
        </div>
        <div role="tablist" aria-label={t.home.bestSellers} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {tabs.map((item) => (
            <button
              key={item.key}
              role="tab"
              type="button"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "shrink-0 rounded-md px-3.5 py-1.5 text-[13px] font-medium transition",
                tab === item.key ? "bg-primary text-white shadow-sm" : "text-ink hover:bg-cream"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title={t.product.noProducts} />
      ) : (
        <div role="tabpanel" className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {filtered.map((p, i) => (
            <div key={p._id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
