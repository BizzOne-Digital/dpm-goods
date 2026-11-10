import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { isAllowedFolder } from "@/lib/uploads";
import StoredUpload from "@/models/StoredUpload";

export const runtime = "nodejs";

/** Lists stored uploads WITHOUT the binary data. */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = 36;
    const query = isAllowedFolder(folder) ? { folder } : {};
    await connectDB();
    const [items, total, totals] = await Promise.all([
      StoredUpload.find(query).select("-data").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      StoredUpload.countDocuments(query),
      StoredUpload.aggregate([{ $group: { _id: null, bytes: { $sum: "$size" }, count: { $sum: 1 } } }]),
    ]);
    return ok({
      items: items.map((i) => ({ ...i, url: `/api/uploads/${i.folder}/${i.filename}` })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      storageBytes: totals[0]?.bytes ?? 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
