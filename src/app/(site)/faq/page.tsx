import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { EmptyState, PageHero } from "@/components/ui/Primitives";
import { getFaqs } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { slugify } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Answers about shipping, returns, sizing, payments and orders at DPM Goods.",
  path: "/faq",
});

export default async function FaqPage() {
  const [{ t }, faqs] = await Promise.all([getDictionary(), getFaqs()]);
  const groups = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
    (acc[f.category || "General"] ??= []).push(f);
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title={t.nav.faq} description="Quick answers to the questions we hear most." breadcrumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.faq }]} align="center" />
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ categories" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
            {Object.keys(groups).map((g) => (
              <li key={g} className="shrink-0">
                <a href={`#${slugify(g)}`} className="block rounded-md px-3 py-2 text-sm font-semibold text-ink hover:bg-cream hover:text-primary">
                  {g}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-10">
          {faqs.length === 0 && <EmptyState title="No FAQs published yet." />}
          {Object.entries(groups).map(([group, items]) => (
            <section key={group} id={slugify(group)} className="scroll-mt-28">
              <h2 className="mb-4 text-xl font-extrabold">{group}</h2>
              <div className="divide-y divide-line rounded-xl border border-line">
                {items.map((f) => (
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
          ))}
          <div className="card flex flex-col items-start gap-4 bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" aria-hidden="true" />
              <p className="font-semibold">Still have questions? Our team is happy to help.</p>
            </div>
            <Link href="/contact" className="btn-primary">{t.footer.contactUs}</Link>
          </div>
        </div>
      </div>
    </>
  );
}
