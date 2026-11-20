import Link from "next/link";
import { Mail } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { EmptyState, PageHero } from "@/components/ui/Primitives";
import { InstagramIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import { getSections, getTeam } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Our Team",
  description: "Meet the merchandisers, stylists and operators behind Universal UPMGoods.",
  path: "/team",
});

export default async function TeamPage() {
  const [{ t }, sections, team] = await Promise.all([getDictionary(), getSections("team"), getTeam()]);
  const hero = sections.hero;

  return (
    <>
      <PageHero eyebrow={hero?.subtitle} title={hero?.title ?? t.nav.team} description={hero?.description} image={hero?.image} breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.team }]} align="center" />
      <section className="container-x py-16">
        {team.length === 0 ? (
          <EmptyState title="Team members will appear here soon." />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <li key={m._id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                  <SmartImage src={m.photo} alt={m.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale-[30%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-gradient-to-t from-ink/80 to-transparent p-4 transition duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
                    {m.socialLinks?.instagram && (
                      <a href={m.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Instagram`} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink hover:bg-primary hover:text-white">
                        <InstagramIcon />
                      </a>
                    )}
                    {m.socialLinks?.linkedin && (
                      <a href={m.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink hover:bg-primary hover:text-white">
                        <LinkedInIcon />
                      </a>
                    )}
                    {m.socialLinks?.email && (
                      <a href={`mailto:${m.socialLinks.email}`} aria-label={`Email ${m.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink hover:bg-primary hover:text-white">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-bold">{m.name}</h2>
                <p className="text-sm font-semibold text-primary">{m.role}</p>
                {m.bio && <p className="mt-2 text-sm leading-relaxed text-muted">{m.bio}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="bg-primary-dark py-14 text-center text-white">
        <div className="container-x">
          <h2 className="text-3xl font-extrabold">Work with our stylists</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Book a one-on-one session and get outfit recommendations tailored to you.</p>
          <Link href="/booking" className="btn-light mt-6">{t.nav.booking}</Link>
        </div>
      </section>
    </>
  );
}
