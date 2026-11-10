import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok } from "@/lib/api";
import { resolveResource } from "@/lib/admin/server";
import { isValidObjectId, slugify } from "@/lib/utils";

export const runtime = "nodejs";

/** Duplicates a document as an unpublished draft with a unique slug. Images are shared, not copied. */
export async function POST(_request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    await requireAdmin();
    const { resource, id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    const { config, model } = resolveResource(resource);
    if (!config.canDuplicate) throw new ApiError("Duplicating is not available for this resource.", 405);
    await connectDB();
    const source = await model.findById(id).lean<Record<string, unknown>>();
    if (!source) throw new ApiError("Not found", 404);

    const { _id, createdAt, updatedAt, __v, ...rest } = source;
    void _id; void createdAt; void updatedAt; void __v;
    const titleKey = "name" in rest ? "name" : "title";
    const baseSlug = slugify(`${rest.slug ?? rest[titleKey]}-copy`);
    let slug = baseSlug;
    for (let i = 2; await model.exists({ slug }); i++) slug = `${baseSlug}-${i}`;

    const copy = await model.create({
      ...rest,
      [titleKey]: `${rest[titleKey]} (Copy)`,
      slug,
      published: false,
      ...(resource === "products" ? { sku: rest.sku ? `${rest.sku}-COPY` : "", salesCount: 0 } : {}),
    });
    return ok({ item: copy.toObject() }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
