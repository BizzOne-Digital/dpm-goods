import Link from "next/link";
import { ArrowRight, Gem, HeartHandshake, ShieldCheck, Truck } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { PageHero } from "@/components/ui/Primitives";
import { TestimonialCard } from "@/components/home/Testimonials";
import { getSections, getTestimonials } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Universal UPM Goods",
  description: "Learn about Universal UPM Goods by Direct Primary Merchandises LLC: a curated online fashion destination for men's and women's clothing, sneakers and essentials.",
  path: "/about",
});

const values = [
  { Icon: Gem, title: "Curated Quality", text: "Every product is reviewed for fabric, fit and finish before it joins our collection." },
  { Icon: HeartHandshake, title: "Honest Value", text: "Fair, transparent pricing with no hidden fees at checkout." },
  { Icon: Truck, title: "Reliable Delivery", text: "A streamlined supplier network that gets orders to you quickly." },
  { Icon: ShieldCheck, title: "Secure Shopping", text: "Encrypted checkout and responsive support from real people." },
];

export default async function AboutPage() {
  const [{ t }, sections, testimonials] = await Promise.all([getDictionary(), getSections("about"), getTestimonials()]);
  const hero = sections.hero;
  const story = sections.story;
  const mission = sections.mission;
  const stats = ((mission?.metadata?.stats as { value: string; label: string }[]) ?? []).slice(0, 4);

  return (
    <>
      {hero?.enabled !== false && (
        <PageHero eyebrow={hero?.subtitle} title={hero?.title ?? "About Universal UPM Goods"} description={hero?.description} image={hero?.image} breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.about }]} />
      )}

      {story?.enabled !== false && story && (
        <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <SmartImage src={story.image} alt="Inside the Universal UPM Goods collection" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden rounded-xl bg-primary-dark p-6 text-white shadow-xl sm:block lg:-right-8">
              <p className="font-display text-4xl font-extrabold">UPM</p>
              <p className="text-xs uppercase tracking-widest text-white/70">Direct Primary Merchandises</p>
            </div>
          </div>
          <div>
            {story.subtitle && <p className="eyebrow">{story.subtitle}<span className="h-px w-10 bg-primary" /></p>}
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{story.title}</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/80">
              {(story.description ?? "").split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">{t.nav.shop} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/team" className="btn-outline">{t.nav.team}</Link>
            </div>
          </div>
        </section>
      )}

      {mission?.enabled !== false && mission && (
        <section className="bg-cream py-16">
          <div className="container-x text-center">
            <h2 className="text-3xl font-extrabold">{mission.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink/80">{mission.description}</p>
            {stats.length > 0 && (
              <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="card p-6">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</dt>
                    <dd className="mt-1 font-display text-3xl font-extrabold text-primary">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      )}

      <section className="container-x py-16">
        <h2 className="text-center text-3xl font-extrabold">What We Stand For</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, text }) => (
            <li key={title} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-cream text-primary"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-cream py-16">
          <div className="container-x">
            <h2 className="text-center text-3xl font-extrabold">{t.home.whatCustomersSay}</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {testimonials.slice(0, 2).map((item) => (
                <TestimonialCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
