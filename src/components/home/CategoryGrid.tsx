import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { SectionHeading } from "@/components/ui/Primitives";
import type { Category } from "@/types";

export function categoryHref(c: Category) {
  return c.href || `/shop?category=${c.slug}`;
}

export default function CategoryGrid({ categories, title, linkText }: { categories: Category[]; title: string; linkText: string }) {
  if (!categories.length) return null;
  return (
    <section className="container-x py-12 sm:py-14" aria-labelledby="categories-title">
      <SectionHeading title={title} linkText={linkText} linkHref="/shop" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.slice(0, 6).map((c, i) => (
          <li key={c._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <Link href={categoryHref(c)} className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-black/5">
              <SmartImage src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" className="object-cover transition duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <h3 className="absolute inset-x-4 bottom-4 text-lg font-extrabold leading-tight text-white sm:text-xl">{c.name}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
