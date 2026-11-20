import Link from "next/link";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getFaqs, getSections } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Pricing",
  description: "Shop free anytime, or book a personal styling session or seasonal VIP wardrobe plan with Universal UPMGoods.",
  path: "/pricing",
});

type Plan = { name: string; price: string; period?: string; description?: string; features: string[]; ctaText?: string; ctaUrl?: string; highlighted?: boolean };

export default async function PricingPage() {
  const [{ t }, sections, faqs] = await Promise.all([getDictionary(), getSections("pricing"), getFaqs()]);
  const hero = sections.hero;
  const plans = (hero?.metadata?.plans as Plan[]) ?? [];

  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <div className="flex justify-center"><Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.pricing }]} /></div>
          {hero?.subtitle && <p className="eyebrow mt-5 justify-center">{hero.subtitle}</p>}
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold sm:text-5xl">{hero?.title ?? "Pricing"}</h1>
          {hero?.description && <p className="mx-auto mt-4 max-w-xl text-base text-ink/75">{hero.description}</p>}
        </div>
      </section>

      <section className="container-x -mt-2 pb-16 pt-10">
        <ul className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <li
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                plan.highlighted ? "border-primary bg-primary-dark text-white shadow-2xl md:-translate-y-3" : "border-line bg-white"
              )}
            >
              {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most Popular</span>}
              <h2 className="text-lg font-bold">{plan.name}</h2>
              {plan.description && <p className={cn("mt-1 text-sm", plan.highlighted ? "text-white/75" : "text-muted")}>{plan.description}</p>}
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className={cn("text-sm", plan.highlighted ? "text-white/70" : "text-muted")}>{plan.period}</span>}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-primary-light" : "text-primary")} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              {plan.ctaText && (
                <Link href={plan.ctaUrl || "/shop"} className={cn("mt-8", plan.highlighted ? "btn-light" : "btn-primary")}>
                  {plan.ctaText}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {faqs.length > 0 && (
        <section className="bg-cream py-16">
          <div className="container-x max-w-3xl">
            <h2 className="text-center text-3xl font-extrabold">{t.nav.faq}</h2>
            <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
              {faqs.slice(0, 4).map((f) => (
                <details key={f._id} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.question}
                    <span className="text-xl text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
