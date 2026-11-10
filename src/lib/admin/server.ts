import "server-only";
import { z } from "zod";
import type { Model } from "mongoose";
import { ApiError } from "@/lib/api";
import { escapeRegex, slugify } from "@/lib/utils";
import { getResource, type FieldDef, type ResourceConfig } from "@/lib/admin/resources";
import { BlogPost, Booking, Category, ContactMessage, FAQ, PageContent, Product, Promotion, TeamMember, Testimonial } from "@/models";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = Model<any>;

const MODELS: Record<string, AnyModel> = {
  products: Product,
  categories: Category,
  blog: BlogPost,
  testimonials: Testimonial,
  team: TeamMember,
  faqs: FAQ,
  pages: PageContent,
  promotions: Promotion,
  bookings: Booking,
  messages: ContactMessage,
};

export function resolveResource(key: string): { config: ResourceConfig; model: AnyModel } {
  const config = getResource(key);
  const model = MODELS[key];
  if (!config || !model) throw new ApiError("Unknown resource", 404);
  return { config, model };
}

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), "Invalid image URL")
  .refine((v) => !v.startsWith("data:"), "Upload the image instead of pasting data");

function fieldSchema(f: FieldDef): z.ZodTypeAny {
  const max = f.max ?? 20000;
  switch (f.type) {
    case "number": {
      const n = z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().finite().min(0).max(10_000_000).optional());
      return f.required ? n.refine((v) => v !== undefined, `${f.label} is required`) : n;
    }
    case "boolean":
      return z.preprocess((v) => v === true || v === "true", z.boolean());
    case "select": {
      const s = z.string().trim().max(120);
      if (f.options && !f.optionsFrom) {
        const values = f.options.map((o) => o.value);
        return f.required ? z.enum(values as [string, ...string[]]) : z.union([z.enum(values as [string, ...string[]]), z.literal("")]).optional();
      }
      return f.required ? s.min(1, `${f.label} is required`) : s.optional();
    }
    case "tags":
      return z.preprocess(
        (v) => (typeof v === "string" ? v.split(",") : v ?? []),
        z.array(z.string().trim().max(80)).max(60).transform((arr) => [...new Set(arr.filter(Boolean))])
      );
    case "image":
      return f.required ? imageUrl.refine((v) => v !== "", `${f.label} is required`) : imageUrl.optional();
    case "gallery":
      return z.preprocess((v) => v ?? [], z.array(imageUrl).max(20).transform((a) => a.filter(Boolean)));
    case "date":
      return z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.date().nullable().optional());
    case "json":
      return z.preprocess((v) => {
        if (typeof v === "string") {
          if (!v.trim()) return {};
          try {
            return JSON.parse(v);
          } catch {
            return "__invalid__";
          }
        }
        return v ?? {};
      }, z.record(z.string(), z.unknown(), { message: "Extra settings must be valid JSON" }));
    case "email": {
      const e = z.string().trim().toLowerCase().max(200).refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email");
      return f.required ? e.refine((v) => v !== "", `${f.label} is required`) : e.optional();
    }
    case "richtext":
    case "textarea":
    case "text":
    case "slug":
    default: {
      const s = z.string().trim().max(f.type === "richtext" ? 200_000 : max);
      return f.required ? s.min(1, `${f.label} is required`) : s.optional();
    }
  }
}

export function buildSchema(config: ResourceConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of config.fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

/** {"socialLinks.instagram": x} -> {socialLinks: {instagram: x}} */
export function unflatten(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const parts = key.split(".");
    let cur = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) cur[p] = value;
      else cur = (cur[p] ??= {}) as Record<string, unknown>;
    });
  }
  return out;
}

async function uniqueSlug(model: AnyModel, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `item-${Date.now()}`;
  let candidate = root;
  for (let i = 2; i < 200; i++) {
    const exists = await model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!exists) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

/** Validates admin input and applies resource-specific rules (slugs, featured image, publish date). */
export async function prepareInput(config: ResourceConfig, model: AnyModel, raw: unknown, excludeId?: string, partial = false) {
  const schema = buildSchema(config);
  const parsed = (partial ? schema.partial() : schema).parse(raw) as Record<string, unknown>;

  for (const f of config.fields) {
    if (f.type === "slug" && (!partial || parsed[f.name] !== undefined || (f.slugFrom && parsed[f.slugFrom] !== undefined && !excludeId))) {
      const source = (parsed[f.name] as string) || (f.slugFrom ? (parsed[f.slugFrom] as string) : "");
      if (source) parsed[f.name] = await uniqueSlug(model, source, excludeId);
    }
    if (f.type === "gallery" && f.featuredField && Array.isArray(parsed[f.name])) {
      const gallery = parsed[f.name] as string[];
      const featured = parsed[f.featuredField] as string | undefined;
      if (!featured || !gallery.includes(featured)) parsed[f.featuredField] = gallery[0] ?? "";
    }
  }

  if (config.key === "blog" && parsed.published === true && !parsed.publishedAt) parsed.publishedAt = new Date();
  if (config.key === "promotions" && typeof parsed.code === "string") parsed.code = parsed.code.toUpperCase().replace(/\s+/g, "") || undefined;

  return unflatten(parsed);
}

/** featuredField isn't a visible form field; allow it through validation. */
export function withHiddenFields(config: ResourceConfig): ResourceConfig {
  const extras: FieldDef[] = [];
  for (const f of config.fields) {
    if (f.type === "gallery" && f.featuredField && !config.fields.some((x) => x.name === f.featuredField)) {
      extras.push({ name: f.featuredField, label: "Featured image", type: "image" });
    }
  }
  return extras.length ? { ...config, fields: [...config.fields, ...extras] } : config;
}

export function buildListQuery(config: ResourceConfig, params: URLSearchParams) {
  const query: Record<string, unknown> = {};
  const q = params.get("q")?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q.slice(0, 80)), "i");
    query.$or = config.searchFields.map((f) => ({ [f]: rx }));
  }
  for (const filter of config.filters ?? []) {
    const v = params.get(filter.name);
    if (v && filter.options.some((o) => o.value === v)) query[filter.name] = v === "true" ? true : v === "false" ? false : v;
  }
  return query;
}
