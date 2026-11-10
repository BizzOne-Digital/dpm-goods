import Link from "next/link";
import { Star } from "lucide-react";
import { TestimonialCard } from "@/components/home/Testimonials";
import { Breadcrumbs, EmptyState } from "@/components/ui/Primitives";
import { getTestimonials } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Customer Reviews",
  description: "Read what customers say about shopping with DPM Goods: quality, fit, fast delivery and support.",
  path: "/testimonials",
});

export default async function TestimonialsPage() {
  const [{ t }, items] = await Promise.all([getDictionary(), getTestimonials()]);
  const avg = items.length ? items.reduce((n, i) => n + i.rating, 0) / items.length : 0;

  return (
    <>
      <section className="bg-cream">
        <div className="container-x grid items-center gap-8 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
          <div>
            <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.testimonials }]} />
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{t.home.whatCustomersSay}</h1>
            <p className="mt-3 max-w-lg text-ink/75">Real feedback from shoppers who trust DPM Goods for everyday style.</p>
          </div>
          {items.length > 0 && (
            <div className="card flex items-center gap-5 p-6">
              <p className="font-display text-6xl font-extrabold text-primary">{avg.toFixed(1)}</p>
              <div>
                <div className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted">Based on {items.length} published reviews</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="container-x py-16">
        {items.length === 0 ? (
          <EmptyState title="No reviews published yet." />
        ) : (
          <ul className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
            {items.map((item) => (
              <li key={item._id}>
                <TestimonialCard item={item} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 text-center">
          <Link href="/shop" className="btn-primary">{t.nav.shop}</Link>
        </div>
      </section>
    </>
  );
}
