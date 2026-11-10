import { CalendarDays, Clock, MailCheck } from "lucide-react";
import BookingForm from "@/components/forms/BookingForm";
import SmartImage from "@/components/ui/SmartImage";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getSections, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book a Styling Session",
  description: "Book a personal styling consultation, wardrobe refresh or corporate order call with DPM Goods.",
  path: "/booking",
});

export default async function BookingPage() {
  const [{ t }, sections, settings] = await Promise.all([getDictionary(), getSections("booking"), getSettings()]);
  const hero = sections.hero;
  const types = settings.bookingTypes?.length ? settings.bookingTypes : ["Personal Styling Consultation"];

  return (
    <section className="bg-cream">
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_1.15fr] lg:py-16">
        <div>
          <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.booking }]} />
          {hero?.subtitle && <p className="eyebrow mt-6">{hero.subtitle}</p>}
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{hero?.title ?? t.nav.booking}</h1>
          {hero?.description && <p className="mt-4 max-w-md text-ink/75">{hero.description}</p>}
          <ul className="mt-8 space-y-4">
            {[
              { Icon: CalendarDays, text: "Choose a date that suits you" },
              { Icon: Clock, text: "Sessions run 30-45 minutes by video or phone" },
              { Icon: MailCheck, text: "Confirmation sent to your email" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          {hero?.image && (
            <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-2xl lg:block">
              <SmartImage src={hero.image} alt="DPM Goods stylist" fill sizes="40vw" className="object-cover" />
            </div>
          )}
        </div>
        <div className="card self-start p-6 sm:p-8">
          <BookingForm bookingTypes={types} />
        </div>
      </div>
    </section>
  );
}
