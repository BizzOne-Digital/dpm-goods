import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { PageHero } from "@/components/ui/Primitives";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/icons/BrandIcons";
import { getSections, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Get in touch with DPM Goods for order support, sizing help or general questions.",
  path: "/contact",
});

export default async function ContactPage() {
  const [{ t }, sections, settings] = await Promise.all([getDictionary(), getSections("contact"), getSettings()]);
  const hero = sections.hero;
  const hours = (hero?.metadata?.hours as string) || "";

  const cards = [
    settings.phone && { Icon: Phone, label: t.forms.phone, value: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` },
    settings.email && { Icon: Mail, label: t.forms.email, value: settings.email, href: `mailto:${settings.email}` },
    settings.address && { Icon: MapPin, label: "Location", value: settings.address },
    hours && { Icon: Clock, label: "Hours", value: hours },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href?: string }[];

  const socials = [
    { href: settings.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: settings.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: settings.tiktok, Icon: TikTokIcon, label: "TikTok" },
    { href: settings.youtube, Icon: YouTubeIcon, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <>
      <PageHero
        eyebrow={hero?.subtitle}
        title={hero?.title ?? t.footer.contactUs}
        description={hero?.description}
        image={hero?.image}
        breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.contact }]}
      />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {cards.map(({ Icon, label, value, href }) => (
            <div key={label} className="card flex items-start gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
                {href ? (
                  <a href={href} className="break-words font-semibold hover:text-primary">
                    {value}
                  </a>
                ) : (
                  <p className="font-semibold">{value}</p>
                )}
              </div>
            </div>
          ))}
          {socials.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Follow us</p>
              <ul className="mt-3 flex gap-2">
                {socials.map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:border-primary hover:bg-primary hover:text-white">
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We usually reply within one business day.</p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
