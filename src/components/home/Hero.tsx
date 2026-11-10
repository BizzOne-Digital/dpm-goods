import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import type { Dictionary } from "@/lib/i18n/config";
import type { PageSection } from "@/types";

export default function Hero({ section, t }: { section: PageSection; t: Dictionary }) {
  const meta = (section.metadata ?? {}) as Record<string, string>;
  const label = meta.label || "Men's & Women's Fashion";

  return (
    <section className="relative overflow-hidden bg-cream" aria-labelledby="hero-title">
      {/* Diagonal editorial backdrop */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-beige lg:block [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:py-0">
        <div className="relative z-10 max-w-xl lg:py-24">
          <p className="eyebrow animate-fade-up">
            {label}
            <span className="h-px w-12 bg-primary" />
          </p>
          <h1 id="hero-title" className="mt-4 animate-fade-up text-[2.6rem] font-extrabold leading-[1.02] text-ink sm:text-6xl xl:text-[4.1rem]" style={{ animationDelay: "80ms" }}>
            {section.title}
            <span className="block text-primary">{section.subtitle}</span>
          </h1>
          <p className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-ink/80 sm:text-lg" style={{ animationDelay: "160ms" }}>
            {section.description}
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            {section.ctaText && (
              <Link href={section.ctaUrl || "/men"} className="btn-primary h-12 px-7">
                {section.ctaText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {meta.secondaryCtaText && (
              <Link href={meta.secondaryCtaUrl || "/women"} className="btn-outline h-12 px-7">
                {meta.secondaryCtaText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="mt-10 flex animate-fade-up flex-wrap gap-x-6 gap-y-3 text-[13px] font-medium text-ink/80" style={{ animationDelay: "320ms" }}>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" aria-hidden="true" /> {t.home.fastDelivery}</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> {t.home.secureCheckout}</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> {t.home.newEveryWeek}</li>
          </ul>
        </div>

        {/* Editorial collage */}
        <div className="relative mx-auto h-[440px] w-full max-w-xl sm:h-[540px] lg:h-[620px] lg:max-w-none">
          <div className="absolute left-0 top-6 h-[85%] w-[56%] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 lg:top-10">
            <SmartImage src={section.image} alt="Male model in a camel blazer and denim" fill priority sizes="(min-width: 1024px) 30vw, 55vw" className="object-cover" />
          </div>
          <div className="absolute bottom-6 right-0 h-[85%] w-[54%] overflow-hidden rounded-2xl shadow-2xl ring-4 ring-cream lg:bottom-10">
            <SmartImage src={meta.secondaryImage} alt="Female model in a camel coat" fill priority sizes="(min-width: 1024px) 30vw, 55vw" className="object-cover" />
          </div>

          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-xl sm:bottom-8 sm:left-6">
            <div className="flex -space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
              ))}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">4.8 / 5</p>
              <p className="text-[11px] text-muted">{t.home.happyCustomers}</p>
            </div>
          </div>

          <Link
            href="/shop?new=1&sort=newest"
            className="group absolute right-2 top-0 z-10 flex items-center gap-2 rounded-full bg-primary-dark px-4 py-2.5 text-xs font-semibold text-white shadow-xl transition hover:bg-primary sm:right-4 lg:top-4"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t.nav.newArrivals}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
