import "server-only";
import { connectDB } from "@/lib/mongodb";
import { UPLOAD_FOLDERS, type UploadFolder } from "@/lib/constants";
import StoredUpload from "@/models/StoredUpload";

const FILENAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}$/;

export function isAllowedFolder(folder: unknown): folder is UploadFolder {
  return typeof folder === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

export function isSafeFilename(filename: unknown): filename is string {
  if (typeof filename !== "string") return false;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) return false;
  return FILENAME_PATTERN.test(filename);
}

/** Parses `/api/uploads/{folder}/{filename}` into its parts, or null if invalid. */
export function parseStoredUploadUrl(url: string): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith("/api/uploads/")) return null;
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.slice("/api/uploads/".length).split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts.map((p) => decodeURIComponent(p));
  if (!isAllowedFolder(folder) || !isSafeFilename(filename)) return null;
  return { folder, filename };
}

/** Deletes a MongoDB-stored upload. External URLs (e.g. Unsplash) are ignored. */
export async function deleteStoredUploadByUrl(url: string): Promise<boolean> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed) return false;
  await connectDB();
  const result = await StoredUpload.deleteOne({ folder: parsed.folder, filename: parsed.filename });
  return result.deletedCount > 0;
}

/** Recursively collects every stored-upload URL found inside a document. */
export function collectUploadUrls(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith("/api/uploads/")) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploadUrls(v, found));
  } else if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("_bsontype" in (value as Record<string, unknown>)) return found;
    Object.values(value as Record<string, unknown>).forEach((v) => collectUploadUrls(v, found));
  }
  return found;
}

/** Counts documents that still reference a stored-upload URL anywhere we store images. */
export async function countUploadReferences(url: string): Promise<number> {
  await connectDB();
  const { BlogPost, Category, PageContent, Product, Promotion, TeamMember, Testimonial, WebsiteSettings } = await import("@/models");
  const contains = { $regex: url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") };
  const counts = await Promise.all([
    Product.countDocuments({ $or: [{ images: url }, { featuredImage: url }, { description: contains }] }),
    Category.countDocuments({ image: url }),
    BlogPost.countDocuments({ $or: [{ featuredImage: url }, { content: contains }] }),
    Testimonial.countDocuments({ avatar: url }),
    TeamMember.countDocuments({ photo: url }),
    PageContent.countDocuments({ $or: [{ image: url }, { description: contains }, { "metadata.secondaryImage": url }] }),
    Promotion.countDocuments({ image: url }),
    WebsiteSettings.countDocuments({ $or: [{ logo: url }, { favicon: url }] }),
  ]);
  return counts.reduce((a, b) => a + b, 0);
}

/**
 * Called AFTER a document is saved or deleted: removes stored images that the
 * previous version referenced but the new one does not (replace/remove flows).
 * Images still used by another document (e.g. a duplicated product) are kept.
 */
export async function cleanupReplacedUploads(previous: unknown, next: unknown): Promise<number> {
  const before = collectUploadUrls(previous);
  const after = collectUploadUrls(next);
  let removed = 0;
  for (const url of before) {
    if (after.has(url)) continue;
    try {
      if ((await countUploadReferences(url)) > 0) continue;
      if (await deleteStoredUploadByUrl(url)) removed++;
    } catch (error) {
      console.error("[uploads] cleanup failed", error);
    }
  }
  return removed;
}
