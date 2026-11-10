import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, PaymentMethods, TikTokIcon, YouTubeIcon } from "@/components/icons/BrandIcons";
import type { Dictionary } from "@/lib/i18n/config";
import type { SiteSettings } from "@/types";

export default function Footer({ settings, t }: { settings: SiteSettings; t: Dictionary }) {
  const socials = [
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((s) => s.href);

  const shopLinks = [
    { label: t.nav.allProducts, href: "/shop" },
    { label: t.nav.men, href: "/men" },
    { label: t.nav.women, href: "/women" },
    { label: t.nav.sneakers, href: "/sneakers" },
    { label: t.nav.jeans, href: "/jeans" },
    { label: t.nav.dresses, href: "/dresses" },
    { label: t.nav.accessories, href: "/accessories" },
  ];
  const quickLinks = [
    { label: t.footer.aboutUs, href: "/about" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.footer.contactUs, href: "/contact" },
    { label: t.nav.faq, href: "/faq" },
    { label: t.footer.shipping, href: "/shipping" },
    { label: t.footer.returns, href: "/returns" },
    { label: t.footer.privacy, href: "/privacy-policy" },
    { label: t.footer.terms, href: "/terms" },
  ];

  const linkCls = "text-[13px] text-white/70 transition hover:text-white";
  const headCls = "mb-4 text-sm font-bold text-white";

  return (
    <footer className="bg-ink text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr_1.2fr] lg:gap-8">
        <div className="lg:border-r lg:border-white/10 lg:pr-8">
          <Logo logo={settings.logo} siteName={settings.siteName} companyName={settings.companyName} variant="light" />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/70">{settings.footerDescription}</p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white/85 transition hover:border-primary-light hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label={t.footer.shop}>
          <h3 className={headCls}>{t.footer.shop}</h3>
          <ul className="space-y-2">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.footer.quickLinks}>
          <h3 className={headCls}>{t.footer.quickLinks}</h3>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className={headCls}>{t.footer.contact}</h3>
          <ul className="space-y-3 text-[13px] text-white/70">
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 hover:text-white">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 break-all hover:text-white">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {settings.address}
              </li>
            )}
          </ul>
        </div>

        <div className="lg:border-l lg:border-white/10 lg:pl-8">
          <h3 className={headCls}>{t.footer.paymentMethods}</h3>
          <PaymentMethods />
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-center text-xs text-white/60">
          &copy; {new Date().getFullYear()} {settings.companyName}. {t.footer.rights} | {settings.siteName}
        </p>
      </div>
    </footer>
  );
}
