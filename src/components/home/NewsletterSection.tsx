import SmartImage from "@/components/ui/SmartImage";
import NewsletterForm from "@/components/forms/NewsletterForm";
import type { PageSection } from "@/types";

export default function NewsletterSection({ section }: { section: PageSection }) {
  return (
    <section className="relative overflow-hidden bg-primary-dark text-white" aria-labelledby="newsletter-title">
      {section.image && <SmartImage src={section.image} alt="" fill sizes="100vw" className="object-cover opacity-20" />}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary-dark/85 to-primary/70" />
      <div className="container-x relative py-14 text-center sm:py-16">
        <h2 id="newsletter-title" className="text-3xl font-extrabold sm:text-4xl">
          {section.title}
        </h2>
        {section.description && <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">{section.description}</p>}
        <NewsletterForm />
      </div>
    </section>
  );
}
