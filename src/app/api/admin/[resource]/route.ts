import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, ok, readJson } from "@/lib/api";
import { buildListQuery, prepareInput, resolveResource, withHiddenFields } from "@/lib/admin/server";
import { ApiError } from "@/lib/api";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ resource: string }> };

/** List documents for a resource: ?q=&page=&limit=&<filter>= */
export async function GET(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { resource } = await params;
    const { config, model } = resolveResource(resource);
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const query = buildListQuery(config, url.searchParams);

    await connectDB();
    const [items, total] = await Promise.all([
      model
        .find(query)
        .select("-content -costPrice")
        .sort(config.defaultSort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      model.countDocuments(query),
    ]);
    return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Create a document. */
export async function POST(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { resource } = await params;
    const { config, model } = resolveResource(resource);
    if (!config.canCreate) throw new ApiError("This resource cannot be created from the admin.", 405);
    await connectDB();
    const data = await prepareInput(withHiddenFields(config), model, await readJson(request));
    const doc = await model.create(data);
    return ok({ item: doc.toObject() }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
