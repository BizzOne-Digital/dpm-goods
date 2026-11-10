import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok, readJson } from "@/lib/api";
import { prepareInput, resolveResource, withHiddenFields } from "@/lib/admin/server";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { isValidObjectId } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  await requireAdmin();
  const { resource, id } = await ctx.params;
  if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
  const resolved = resolveResource(resource);
  await connectDB();
  return { ...resolved, id };
}

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { model, id } = await load(ctx);
    const item = await model.findById(id).lean();
    if (!item) throw new ApiError("Not found", 404);
    return ok({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Full update. Old stored images that are no longer referenced are deleted AFTER the save succeeds. */
export async function PUT(request: Request, ctx: Ctx) {
  try {
    const { config, model, id } = await load(ctx);
    const previous = await model.findById(id).lean();
    if (!previous) throw new ApiError("Not found", 404);
    const data = await prepareInput(withHiddenFields(config), model, await readJson(request), id);
    const item = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    await cleanupReplacedUploads(previous, item);
    return ok({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Partial update for inline toggles, status changes and reordering. */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { config, model, id } = await load(ctx);
    const previous = await model.findById(id).lean();
    if (!previous) throw new ApiError("Not found", 404);
    const data = await prepareInput(withHiddenFields(config), model, await readJson(request), id, true);
    if (!Object.keys(data).length) throw new ApiError("Nothing to update", 400);
    const item = await model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
    await cleanupReplacedUploads(previous, item);
    return ok({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Delete the document and any MongoDB-stored images it referenced (external URLs are untouched). */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const { model, id } = await load(ctx);
    const item = await model.findByIdAndDelete(id).lean();
    if (!item) throw new ApiError("Not found", 404);
    await cleanupReplacedUploads(item, null);
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
