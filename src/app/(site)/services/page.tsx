import Link from "next/link";
import { ArrowRight, Building2, CalendarCheck, Gift, Headphones, RefreshCw, Shirt, Sparkles } from "lucide-react";
import { PageHero } from "@/components/ui/Primitives";
import { getSections } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Services",
  description: "Personal styling, wardrobe refresh, gift wrapping and corporate orders from Universal UPM Goods.",
  path: "/services",
});

const ICONS = { Sparkles, Shirt, Gift, Building2, RefreshCw, Headphones } as const;

const steps = [
  { title: "Choose a service", text: "Pick the styling or support option that fits your needs." },
  { title: "Book a time", text: "Select a date and time that works for you online." },
  { title: "Meet your stylist", text: "Get personalized picks, fit advice and a shoppable plan." },
];

export default async function ServicesPage() {
  const [{ t }, sections] = await Promise.all([getDictionary(), getSections("services")]);
  const hero = sections.hero;
  const items = (hero?.metadata?.items as { title: string; description: string; icon?: string }[]) ?? [];

  return (
    <>
      <PageHero eyebrow={hero?.subtitle} title={hero?.title ?? "Services"} description={hero?.description} image={hero?.image} breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.services }]}>
        <Link href="/booking" className="btn-light mt-7">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" /> {t.nav.booking}
        </Link>
      </PageHero>

      <section className="container-x py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Sparkles;
            return (
              <li key={item.title} className="card group relative overflow-hidden p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-cream transition group-hover:text-beige" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative grid h-12 w-12 place-items-center rounded-lg bg-primary text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="relative mt-5 text-lg font-bold">{item.title}</h2>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-cream py-16">
        <div className="container-x">
          <h2 className="text-center text-3xl font-extrabold">How It Works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-dark font-display text-xl font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/booking" className="btn-primary">{t.nav.booking} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/pricing" className="btn-outline">{t.nav.pricing}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
