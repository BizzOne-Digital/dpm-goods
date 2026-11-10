import { randomBytes } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/api";
import { ALLOWED_IMAGE_TYPES, EXTENSION_MAP, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { isAllowedFolder } from "@/lib/uploads";
import StoredUpload from "@/models/StoredUpload";

// Buffer + Mongo binary storage require the Node.js runtime.
export const runtime = "nodejs";

/**
 * Stores an image in MongoDB (StoredUpload) instead of the filesystem so uploads
 * survive serverless redeploys. Returns the public URL to save on documents.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return fail("Invalid upload request.", 400);
    }

    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!isAllowedFolder(folder)) return fail("Invalid upload folder.", 400);
    if (!file || typeof file === "string") return fail("No file was provided.", 400);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return fail("Unsupported file type. Use JPG, PNG, WebP or GIF.", 415);
    }
    if (file.size <= 0) return fail("The file is empty.", 400);
    if (file.size > MAX_UPLOAD_BYTES) return fail("File is too large. Maximum size is 8 MB.", 413);

    const ext = EXTENSION_MAP[file.type];
    const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await connectDB();
    await StoredUpload.create({
      folder,
      filename,
      mimeType: file.type,
      size: buffer.length,
      data: buffer,
    });

    return ok(
      {
        url: `/api/uploads/${folder}/${filename}`,
        filename,
        size: buffer.length,
        folder,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
