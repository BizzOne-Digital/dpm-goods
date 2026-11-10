import type { MetadataRoute } from "next";
import { getBlogPosts, getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/", "/shop", "/men", "/women", "/sneakers", "/jeans", "/dresses", "/accessories",
  "/about", "/services", "/pricing", "/testimonials", "/faq", "/contact", "/booking", "/team", "/blog",
  "/privacy-policy", "/terms", "/shipping", "/returns",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts({ limit: 60, sort: "newest" }), getBlogPosts(200)]);
  const now = new Date();
  return [
    ...STATIC_PATHS.map((p) => ({ url: siteUrl(p), lastModified: now, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...products.items.map((p) => ({ url: siteUrl(`/shop/${p.slug}`), lastModified: p.createdAt ? new Date(p.createdAt) : now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: siteUrl(`/blog/${p.slug}`), lastModified: p.publishedAt ? new Date(p.publishedAt) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
