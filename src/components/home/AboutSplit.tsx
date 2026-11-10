import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import type { PageSection } from "@/types";

export default function AboutSplit({ section }: { section: PageSection }) {
  const paragraphs = (section.description ?? "").split(/\n{2,}/).filter(Boolean);
  return (
    <section className="grid items-center lg:grid-cols-2" aria-labelledby="about-title">
      <div className="relative h-72 sm:h-96 lg:h-[460px]">
        <SmartImage src={section.image} alt="Curated fashion collection" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="px-4 py-12 sm:px-10 lg:px-14 xl:px-20">
        {section.subtitle && (
          <p className="eyebrow">
            {section.subtitle}
            <span className="h-px w-12 bg-primary" />
          </p>
        )}
        <h2 id="about-title" className="mt-3 max-w-lg text-3xl font-extrabold leading-tight sm:text-4xl">
          {section.title}
        </h2>
        <div className="mt-4 max-w-xl space-y-3 text-[15px] leading-relaxed text-ink/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {section.ctaText && (
          <Link href={section.ctaUrl || "/about"} className="btn-primary mt-7">
            {section.ctaText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
