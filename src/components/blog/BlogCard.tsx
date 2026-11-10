import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogCard({ post, readMore, layout = "row" }: { post: BlogPost; readMore: string; layout?: "row" | "stack" }) {
  const href = `/blog/${post.slug}`;
  if (layout === "stack") {
    return (
      <article className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-cream">
          <SmartImage src={post.featuredImage} alt={post.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        </Link>
        <div className="flex flex-1 flex-col p-5">
          {post.category && <span className="w-fit rounded bg-beige px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-dark">{post.category}</span>}
          <h3 className="mt-3 text-lg font-bold leading-snug">
            <Link href={href} className="hover:text-primary">{post.title}</Link>
          </h3>
          {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>}
          <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(post.publishedAt)}</span>
            <Link href={href} className="inline-flex items-center gap-1 font-semibold text-primary">
              {readMore} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="card group flex h-full overflow-hidden transition hover:shadow-md">
      <Link href={href} className="relative w-[42%] shrink-0 overflow-hidden bg-cream">
        <SmartImage src={post.featuredImage} alt={post.title} fill sizes="(min-width: 1024px) 14vw, 40vw" className="object-cover transition duration-700 group-hover:scale-105" />
      </Link>
      <div className="flex flex-col p-4">
        {post.category && <span className="w-fit rounded bg-beige px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary-dark">{post.category}</span>}
        <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-snug">
          <Link href={href} className="hover:text-primary">{post.title}</Link>
        </h3>
        <p className="mt-1 text-[11px] text-muted">{formatDate(post.publishedAt)}</p>
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
          {readMore} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
