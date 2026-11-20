import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import SmartImage from "@/components/ui/SmartImage";
import { Breadcrumbs } from "@/components/ui/Primitives";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { sanitizeRichText } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";
import { formatDate, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return buildMetadata({ title: "Article not found", path: `/blog/${slug}`, noIndex: true });
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.featuredImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const [{ t }, latest] = await Promise.all([getDictionary(), getBlogPosts(4)]);
  const more = latest.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author || "Universal UPMGoods" },
    publisher: { "@type": "Organization", name: "Universal UPMGoods" },
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="container-x max-w-4xl pt-10 text-center">
        <div className="flex justify-center">
          <Breadcrumbs items={[{ label: t.nav.home, href: "/" }, { label: t.nav.blog, href: "/blog" }, { label: post.category || post.title }]} />
        </div>
        {post.category && <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">{post.category}</p>}
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" aria-hidden="true" /> {post.author}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" /> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>
        </p>
      </header>
      <div className="container-x mt-8 max-w-5xl">
        <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-cream">
          <SmartImage src={post.featuredImage} alt={post.title} fill priority sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />
        </div>
      </div>
      <div className="container-x max-w-3xl py-10">
        {post.excerpt && <p className="mb-6 text-lg font-medium leading-relaxed text-ink/85">{post.excerpt}</p>}
        <div className="prose-dpm" dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }} />
        {post.tags?.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink">#{tag}</li>
            ))}
          </ul>
        )}
        <Link href="/blog" className="btn-outline mt-10">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.nav.blog}
        </Link>
      </div>
      {more.length > 0 && (
        <section className="bg-cream py-14">
          <div className="container-x">
            <h2 className="mb-6 text-2xl font-extrabold">{t.home.fromBlog}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <BlogCard key={p._id} post={p} readMore={t.common.readMore} layout="stack" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
