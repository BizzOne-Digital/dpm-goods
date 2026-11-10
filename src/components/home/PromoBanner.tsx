import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import type { Promotion } from "@/types";

export default function PromoBanner({ promo }: { promo: Promotion }) {
  return (
    <section className="relative overflow-hidden bg-primary-dark text-white" aria-labelledby="promo-title">
      {promo.image && <SmartImage src={promo.image} alt="" fill sizes="100vw" className="object-cover opacity-25" />}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/90 to-primary/70" />
      <div className="container-x relative grid items-center gap-6 py-10 md:grid-cols-[1.3fr_auto_1fr] md:gap-10">
        <div>
          {promo.label && (
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/85">
              {promo.label}
              <span className="h-px w-10 bg-white/60" />
            </p>
          )}
          <h2 id="promo-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">
            {promo.title}
          </h2>
          {promo.subtitle && <p className="mt-2 text-sm text-white/80 sm:text-base">{promo.subtitle}</p>}
        </div>
        <span className="hidden h-20 w-px bg-white/30 md:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          {promo.discountText && (
            <p className="leading-none">
              {promo.discountLabel && <span className="block text-xs font-bold uppercase tracking-widest text-white/80">{promo.discountLabel}</span>}
              <span className="mt-1 block font-display text-4xl font-extrabold sm:text-5xl">{promo.discountText}</span>
            </p>
          )}
          {promo.ctaText && (
            <Link href={promo.ctaUrl || "/shop?sale=1"} className="btn-light h-12 px-6">
              {promo.ctaText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
