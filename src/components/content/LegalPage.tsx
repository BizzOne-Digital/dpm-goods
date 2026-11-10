import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getDictionary } from "@/lib/i18n/server";

const LINKS = [
  { href: "/shipping", key: "shipping" },
  { href: "/returns", key: "returns" },
  { href: "/privacy-policy", key: "privacy" },
  { href: "/terms", key: "terms" },
] as const;

/** Shared layout for policy pages; content comes from admin (Pages > legal) or Website Settings. */
export default async function LegalPage({ title, html, current, updated }: { title: string; html: string; current: string; updated?: string }) {
  const { t } = await getDictionary();
  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-x py-12">
          <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: title }]} />
          <h1 className="mt-4 text-4xl font-extrabold">{title}</h1>
          {updated && <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>}
        </div>
      </section>
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
            {LINKS.map((l) => (
              <li key={l.href} className="shrink-0">
                <Link
                  href={l.href}
                  aria-current={current === l.href ? "page" : undefined}
                  className={current === l.href ? "block rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white" : "block rounded-md px-3 py-2 text-sm font-medium hover:bg-cream"}
                >
                  {t.footer[l.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="prose-dpm max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}
