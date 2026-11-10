import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import SmartImage from "@/components/ui/SmartImage";
import { Breadcrumbs, EmptyState } from "@/components/ui/Primitives";
import { getBlogPosts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { cn, formatDate } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Style Journal",
  description: "Style tips, fashion trends and sneaker guides from the DPM Goods editorial team.",
  path: "/blog",
});

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ t }, sp] = await Promise.all([getDictionary(), searchParams]);
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const [all, posts] = await Promise.all([getBlogPosts(50), getBlogPosts(50, category)]);
  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))] as string[];
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-12 sm:py-16">
          <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.blog }]} />
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{t.home.fromBlog}</h1>
          <p className="mt-3 max-w-xl text-ink/75">Style advice, trend reports and practical guides to help you dress with confidence.</p>
          {categories.length > 0 && (
            <ul className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
              {[undefined, ...categories].map((c) => (
                <li key={c ?? "all"} className="shrink-0">
                  <Link
                    href={c ? `/blog?category=${encodeURIComponent(c)}` : "/blog"}
                    aria-current={category === c ? "page" : undefined}
                    className={cn("inline-flex rounded-full border px-4 py-2 text-xs font-semibold transition", category === c ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary")}
                  >
                    {c ?? t.home.tabAll}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="container-x py-12">
        {!featured ? (
          <EmptyState title="No blog posts have been published." />
        ) : (
          <>
            <article className="group grid overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-2">
              <Link href={`/blog/${featured.slug}`} className="relative aspect-[16/10] overflow-hidden bg-cream lg:aspect-auto lg:min-h-[380px]">
                <SmartImage src={featured.featuredImage} alt={featured.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                {featured.category && <span className="w-fit rounded bg-beige px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-dark">{featured.category}</span>}
                <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
                  <Link href={`/blog/${featured.slug}`} className="hover:text-primary">{featured.title}</Link>
                </h2>
                {featured.excerpt && <p className="mt-3 text-ink/75">{featured.excerpt}</p>}
                <p className="mt-4 text-sm text-muted">{formatDate(featured.publishedAt)} · {featured.author}</p>
                <Link href={`/blog/${featured.slug}`} className="btn-primary mt-6 w-fit">
                  {t.common.readMore} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <BlogCard key={post._id} post={post} readMore={t.common.readMore} layout="stack" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
