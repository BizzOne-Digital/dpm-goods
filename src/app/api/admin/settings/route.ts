import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, ok, readJson } from "@/lib/api";
import { SETTINGS_CONFIG } from "@/lib/admin/resources";
import { buildSchema } from "@/lib/admin/server";
import { defaultSettings } from "@/lib/demo-data";
import { cleanupReplacedUploads } from "@/lib/uploads";
import WebsiteSettings from "@/models/WebsiteSettings";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await WebsiteSettings.findOne().lean();
    return ok({ item: { ...defaultSettings, ...(doc ?? {}) } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = buildSchema(SETTINGS_CONFIG).parse(await readJson(request));
    await connectDB();
    const previous = await WebsiteSettings.findOne().lean();
    const item = await WebsiteSettings.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    await cleanupReplacedUploads(previous, item);
    return ok({ item });
  } catch (error) {
    return handleApiError(error);
  }
}
