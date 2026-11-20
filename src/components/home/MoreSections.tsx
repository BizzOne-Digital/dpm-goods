import Link from "next/link";
import { ArrowRight, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import ProductCard from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/ui/Primitives";
import type { Dictionary } from "@/lib/i18n/config";
import type { FAQItem, Product } from "@/types";

const IMG = "/dpm_goods_images/";
const REM = "/dpm_goods_remaining_images/";

/** Scrolling trust strip under the hero. */
export function TrustStrip({ t }: { t: Dictionary }) {
  const items = [
    { Icon: Truck, text: t.home.trustShipping },
    { Icon: RotateCcw, text: t.home.trustReturns },
    { Icon: ShieldCheck, text: t.home.trustSecure },
    { Icon: Headphones, text: t.home.trustSupport },
  ];
  return (
    <section aria-label="Store benefits" className="border-y border-line bg-white">
      <ul className="container-x grid grid-cols-2 gap-y-3 py-4 lg:grid-cols-4">
        {items.map(({ Icon, text }) => (
          <li key={text} className="flex items-center justify-center gap-2.5 text-[13px] font-semibold text-ink lg:border-r lg:border-line lg:last:border-0">
            <Icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Two large editorial cards: Men / Women. */
export function GenderBanners({ t }: { t: Dictionary }) {
  const cards = [
    { href: "/men", img: `${IMG}06-men-clothing.png`, label: t.home.menBannerLabel, title: t.home.menBannerTitle, text: t.home.menBannerText, alt: "Men's fashion" },
    { href: "/women", img: `${IMG}07-women-clothing.png`, label: t.home.womenBannerLabel, title: t.home.womenBannerTitle, text: t.home.womenBannerText, alt: "Women's fashion" },
  ];
  return (
    <section className="container-x pb-14" aria-label="Shop men and women">
      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group relative block h-[420px] overflow-hidden rounded-2xl sm:h-[480px]">
            <SmartImage src={c.img} alt={c.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-top transition duration-[1200ms] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/25 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{c.label}</p>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{c.title}</h2>
              <p className="mt-2 max-w-sm text-sm text-white/85">{c.text}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-cream">
                {t.home.shopNow} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** New arrivals product row. */
export function NewArrivals({ products, t }: { products: Product[]; t: Dictionary }) {
  if (!products.length) return null;
  return (
    <section className="container-x py-14" aria-label={t.home.newArrivalsTitle}>
      <SectionHeading title={t.home.newArrivalsTitle} linkText={t.home.viewAllProducts} linkHref="/shop?new=1&sort=newest" className="mb-2" />
      <p className="mb-6 text-sm text-muted">{t.home.newArrivalsText}</p>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

/** Lookbook gallery with shoppable tiles. */
export function Lookbook({ t }: { t: Dictionary }) {
  const looks = [
    { img: `${REM}12-satin-slip-dress.png`, href: "/shop/satin-slip-dress", alt: "Woman in a brown satin slip dress", cls: "md:row-span-2" },
    { img: `${REM}16-premium-hoodie.png`, href: "/shop/premium-hoodie", alt: "Man in a black premium hoodie", cls: "" },
    { img: `${REM}14-classic-lifestyle-sneakers.png`, href: "/shop/classic-lifestyle-sneakers", alt: "Brown and white lifestyle sneakers", cls: "" },
    { img: `${REM}13-ribbed-knit-sweater.png`, href: "/shop/ribbed-knit-sweater", alt: "Woman in a cream ribbed knit sweater", cls: "md:row-span-2" },
    { img: `${REM}15-slim-fit-jeans.png`, href: "/shop/slim-fit-jeans", alt: "Slim fit blue jeans with white sneakers", cls: "" },
    { img: `${REM}11-accessories.png`, href: "/accessories", alt: "Sunglasses, watch and leather belt", cls: "" },
  ];
  return (
    <section className="bg-cream py-14 sm:py-16" aria-labelledby="lookbook-title">
      <div className="container-x">
        <div className="mb-8 text-center">
          <p className="eyebrow justify-center">{t.home.lookbookLabel}</p>
          <h2 id="lookbook-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">{t.home.lookbookTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">{t.home.lookbookText}</p>
        </div>
        <ul className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[240px] md:grid-cols-4 md:gap-4">
          {looks.map((l) => (
            <li key={l.img} className={l.cls}>
              <Link href={l.href} className="group relative block h-full overflow-hidden rounded-xl">
                <SmartImage src={l.img} alt={l.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 to-transparent p-4 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    {t.home.shopTheLook} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Brand stats band. */
export function StatsBand({ t }: { t: Dictionary }) {
  const stats = [
    { value: "10K+", label: t.home.statCustomers },
    { value: "500+", label: t.home.statStyles },
    { value: "4.8/5", label: t.home.statRating },
    { value: "30-Day", label: t.home.statReturns },
  ];
  return (
    <section className="bg-ink py-12 text-white" aria-label="Universal UPM Goods in numbers">
      <dl className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-1 text-xs font-medium uppercase tracking-widest text-white/60">{s.label}</dt>
            <dd className="font-display text-3xl font-extrabold text-primary-light sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Short FAQ preview with a link to the full page. */
export function FaqPreview({ faqs, t }: { faqs: FAQItem[]; t: Dictionary }) {
  if (!faqs.length) return null;
  return (
    <section className="container-x grid gap-8 py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-14" aria-labelledby="faq-preview-title">
      <div>
        <h2 id="faq-preview-title" className="text-3xl font-extrabold">{t.home.faqTitle}</h2>
        <p className="mt-3 text-muted">{t.home.faqText}</p>
        <Link href="/faq" className="btn-primary mt-6">
          {t.home.viewAllFaqs} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="divide-y divide-line rounded-xl border border-line">
        {faqs.slice(0, 4).map((f) => (
          <details key={f._id} className="group p-5 open:bg-cream/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {f.question}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream text-lg text-primary transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
