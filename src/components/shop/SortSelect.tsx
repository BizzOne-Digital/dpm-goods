"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

export default function SortSelect() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const options = [
    { v: "featured", l: t.shop.sortFeatured },
    { v: "newest", l: t.shop.sortNewest },
    { v: "price-asc", l: t.shop.sortPriceAsc },
    { v: "price-desc", l: t.shop.sortPriceDesc },
    { v: "best-selling", l: t.shop.sortBest },
  ];

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">{t.shop.sort}</span>
      <select
        value={params.get("sort") ?? "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          next.delete("page");
          router.push(`${pathname}?${next}`, { scroll: false });
        }}
        className="input w-auto min-w-44 py-2"
        aria-label={t.shop.sort}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}
