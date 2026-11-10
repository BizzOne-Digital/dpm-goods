import { Quote } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { StarRating } from "@/components/ui/Primitives";
import type { Testimonial } from "@/types";

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="card relative flex h-full flex-col p-6 transition hover:shadow-md">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-beige" aria-hidden="true" />
      <div className="flex items-center gap-3">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-cream ring-2 ring-beige">
          <SmartImage src={item.avatar} alt={item.name} fill sizes="56px" className="object-cover" />
        </span>
        <figcaption>
          <p className="font-bold">{item.name}</p>
          <StarRating value={item.rating} className="mt-1" />
        </figcaption>
      </div>
      <blockquote className="mt-4 text-sm italic leading-relaxed text-ink/80">&ldquo;{item.review}&rdquo;</blockquote>
    </figure>
  );
}

/** Scroll-snap row on mobile, 3-column grid on desktop. */
export default function Testimonials({ items, title }: { items: Testimonial[]; title: string }) {
  if (!items.length) return null;
  return (
    <section className="container-x py-12 sm:py-14" aria-label={title}>
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className="hidden h-px w-14 bg-primary/60 sm:block" />
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{title}</h2>
        <span className="hidden h-px w-14 bg-primary/60 sm:block" />
      </div>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
        {items.slice(0, 3).map((item) => (
          <li key={item._id} className="w-[85%] shrink-0 snap-center sm:w-[60%] md:w-auto">
            <TestimonialCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
