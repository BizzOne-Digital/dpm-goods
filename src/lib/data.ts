import "server-only";
import { cache } from "react";
import type { SortOrder } from "mongoose";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { escapeRegex, toPlain } from "@/lib/utils";
import {
  defaultSections,
  defaultSettings,
  demoBlogPosts,
  demoCategories,
  demoFaqs,
  demoProducts,
  demoPromotion,
  demoTeam,
  demoTestimonials,
} from "@/lib/demo-data";
import {
  BlogPost as BlogPostModel,
  Category as CategoryModel,
  FAQ as FAQModel,
  PageContent,
  Product as ProductModel,
  Promotion as PromotionModel,
  TeamMember as TeamModel,
  Testimonial as TestimonialModel,
  WebsiteSettings,
} from "@/models";
import type {
  BlogPost,
  Category,
  FAQItem,
  PageSection,
  Product,
  Promotion,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/types";

const withIds = <T>(items: T[], prefix: string) =>
  items.map((item, i) => ({ _id: `${prefix}-${i + 1}`, ...item })) as (T & { _id: string })[];

const demo = {
  products: withIds(demoProducts, "demo-product").map((p, i) => ({
    ...p,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  })) as Product[],
  categories: withIds(demoCategories, "demo-category") as Category[],
  blog: withIds(demoBlogPosts, "demo-post") as BlogPost[],
  testimonials: withIds(demoTestimonials, "demo-testimonial") as Testimonial[],
  team: withIds(demoTeam, "demo-team") as TeamMember[],
  faqs: withIds(demoFaqs, "demo-faq") as FAQItem[],
};

/** Runs a DB query; uses demo data when the DB isn't configured, and a safe empty value on errors. */
async function withDb<T>(query: () => Promise<T>, demoValue: () => T, emptyValue: () => T): Promise<T> {
  if (!isDbConfigured()) return demoValue();
  try {
    await connectDB();
    return await query();
  } catch (error) {
    console.error("[data]", error);
    return emptyValue();
  }
}

export const usingDemoData = () => !isDbConfigured();

/* ------------------------------ Settings ------------------------------ */

export const getSettings = cache(async (): Promise<SiteSettings> =>
  withDb(
    async () => {
      const doc = await WebsiteSettings.findOne().lean();
      return { ...defaultSettings, ...(doc ? toPlain<Partial<SiteSettings>>(doc) : {}) };
    },
    () => defaultSettings,
    () => defaultSettings
  )
);

/* ---------------------------- Page content ---------------------------- */

export const getSections = cache(async (page: string): Promise<Record<string, PageSection>> => {
  const defaults = defaultSections.filter((s) => s.page === page);
  const docs = await withDb(
    async () => toPlain<PageSection[]>(await PageContent.find({ page }).lean()),
    () => [] as PageSection[],
    () => [] as PageSection[]
  );
  const map: Record<string, PageSection> = {};
  for (const s of defaults) map[s.sectionKey] = { ...s };
  for (const d of docs) map[d.sectionKey] = { ...(map[d.sectionKey] ?? {}), ...d } as PageSection;
  return map;
});

export async function getSection(page: string, key: string): Promise<PageSection | undefined> {
  const sections = await getSections(page);
  const section = sections[key];
  return section && section.enabled !== false ? section : undefined;
}

/* ----------------------------- Categories ----------------------------- */

export const getCategories = cache(async (): Promise<Category[]> =>
  withDb(
    async () => toPlain<Category[]>(await CategoryModel.find({ published: true }).sort({ sortOrder: 1 }).lean()),
    () => demo.categories,
    () => []
  )
);

/* ------------------------------ Products ------------------------------ */

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "best-selling";

export type ProductFilters = {
  q?: string;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  sale?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

const SORTS: Record<ProductSort, Record<string, SortOrder>> = {
  featured: { featured: -1, bestSeller: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "best-selling": { salesCount: -1 },
};

function genderValues(gender?: string): string[] | undefined {
  if (gender === "men") return ["men", "unisex"];
  if (gender === "women") return ["women", "unisex"];
  if (gender === "unisex") return ["unisex"];
  return undefined;
}

function filterDemo(items: Product[], f: ProductFilters): Product[] {
  const q = f.q?.toLowerCase().trim();
  const genders = genderValues(f.gender);
  let list = items.filter((p) => {
    if (!p.published) return false;
    if (q && !`${p.name} ${p.tags.join(" ")} ${p.shortDescription ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.category && p.category !== f.category) return false;
    if (genders && !genders.includes(p.gender)) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.sizes?.length && !p.sizes.some((s) => f.sizes!.includes(s))) return false;
    if (f.colors?.length && !p.colors.some((c) => f.colors!.includes(c))) return false;
    if (f.inStock && p.stock <= 0) return false;
    if (f.sale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
    if (f.bestSeller && !p.bestSeller) return false;
    if (f.newArrival && !p.newArrival) return false;
    if (f.featured && !p.featured) return false;
    return true;
  });
  const sort = f.sort ?? "featured";
  list = [...list].sort((a, b) => {
    switch (sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "best-selling": return (b.salesCount ?? 0) - (a.salesCount ?? 0);
      case "newest": return String(b.createdAt).localeCompare(String(a.createdAt));
      default: return Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller);
    }
  });
  return list;
}

export async function getProducts(filters: ProductFilters = {}): Promise<{ items: Product[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 60);
  const page = Math.max(filters.page ?? 1, 1);

  return withDb(
    async () => {
      const query: Record<string, any> = { published: true }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (filters.q) {
        const rx = new RegExp(escapeRegex(filters.q.slice(0, 80)), "i");
        query.$or = [{ name: rx }, { tags: rx }, { shortDescription: rx }];
      }
      if (filters.category) query.category = filters.category;
      const genders = genderValues(filters.gender);
      if (genders) query.gender = { $in: genders };
      if (filters.minPrice != null || filters.maxPrice != null) {
        query.price = {};
        if (filters.minPrice != null) query.price.$gte = filters.minPrice;
        if (filters.maxPrice != null) query.price.$lte = filters.maxPrice;
      }
      if (filters.sizes?.length) query.sizes = { $in: filters.sizes };
      if (filters.colors?.length) query.colors = { $in: filters.colors };
      if (filters.inStock) query.stock = { $gt: 0 };
      if (filters.sale) query.$expr = { $gt: ["$compareAtPrice", "$price"] };
      if (filters.bestSeller) query.bestSeller = true;
      if (filters.newArrival) query.newArrival = true;
      if (filters.featured) query.featured = true;

      const [items, total] = await Promise.all([
        ProductModel.find(query)
          .select("-costPrice")
          .sort(SORTS[filters.sort ?? "featured"])
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        ProductModel.countDocuments(query),
      ]);
      return { items: toPlain<Product[]>(items), total };
    },
    () => {
      const all = filterDemo(demo.products, filters);
      return { items: all.slice((page - 1) * limit, page * limit), total: all.length };
    },
    () => ({ items: [], total: 0 })
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return withDb(
    async () => {
      const doc = await ProductModel.findOne({ slug, published: true }).select("-costPrice").lean();
      return doc ? toPlain<Product>(doc) : null;
    },
    () => demo.products.find((p) => p.slug === slug) ?? null,
    () => null
  );
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { items } = await getProducts({ category: product.category, limit: limit + 1 });
  const related = items.filter((p) => p.slug !== product.slug).slice(0, limit);
  if (related.length >= limit) return related;
  const { items: extra } = await getProducts({ gender: product.gender, limit: limit + 6, sort: "best-selling" });
  for (const p of extra) {
    if (related.length >= limit) break;
    if (p.slug !== product.slug && !related.some((r) => r.slug === p.slug)) related.push(p);
  }
  return related;
}

export async function getProductFacets(): Promise<{ sizes: string[]; colors: string[]; maxPrice: number }> {
  return withDb(
    async () => {
      const [sizes, colors, max] = await Promise.all([
        ProductModel.distinct("sizes", { published: true }),
        ProductModel.distinct("colors", { published: true }),
        ProductModel.findOne({ published: true }).sort({ price: -1 }).select("price").lean(),
      ]);
      return { sizes: (sizes as string[]).filter(Boolean), colors: (colors as string[]).filter(Boolean), maxPrice: Math.ceil(max?.price ?? 200) };
    },
    () => ({
      sizes: [...new Set(demo.products.flatMap((p) => p.sizes))],
      colors: [...new Set(demo.products.flatMap((p) => p.colors))],
      maxPrice: Math.ceil(Math.max(...demo.products.map((p) => p.price))),
    }),
    () => ({ sizes: [], colors: [], maxPrice: 200 })
  );
}

/* ------------------------------ Content ------------------------------- */

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  withDb(
    async () => toPlain<Testimonial[]>(await TestimonialModel.find({ published: true }).sort({ sortOrder: 1 }).lean()),
    () => demo.testimonials,
    () => []
  )
);

export async function getBlogPosts(limit = 12, category?: string): Promise<BlogPost[]> {
  return withDb(
    async () => {
      const query: Record<string, unknown> = { published: true };
      if (category) query.category = category;
      return toPlain<BlogPost[]>(await BlogPostModel.find(query).select("-content").sort({ publishedAt: -1 }).limit(limit).lean());
    },
    () => demo.blog.filter((b) => !category || b.category === category).slice(0, limit),
    () => []
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return withDb(
    async () => {
      const doc = await BlogPostModel.findOne({ slug, published: true }).lean();
      return doc ? toPlain<BlogPost>(doc) : null;
    },
    () => demo.blog.find((b) => b.slug === slug) ?? null,
    () => null
  );
}

export const getTeam = cache(async (): Promise<TeamMember[]> =>
  withDb(
    async () => toPlain<TeamMember[]>(await TeamModel.find({ published: true }).sort({ sortOrder: 1 }).lean()),
    () => demo.team,
    () => []
  )
);

export const getFaqs = cache(async (): Promise<FAQItem[]> =>
  withDb(
    async () => toPlain<FAQItem[]>(await FAQModel.find({ published: true }).sort({ sortOrder: 1 }).lean()),
    () => demo.faqs,
    () => []
  )
);

export const getActivePromotion = cache(async (placement = "home"): Promise<Promotion | null> =>
  withDb(
    async () => {
      const now = new Date();
      const doc = await PromotionModel.findOne({
        enabled: true,
        placement,
        $and: [
          { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
          { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
        ],
      })
        .sort({ updatedAt: -1 })
        .lean();
      return doc ? toPlain<Promotion>(doc) : null;
    },
    () => demoPromotion,
    () => null
  )
);
