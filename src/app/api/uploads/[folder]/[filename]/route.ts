import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { isAllowedFolder, isSafeFilename } from "@/lib/uploads";
import StoredUpload from "@/models/StoredUpload";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/** Serves images stored in MongoDB. Filenames are unique and immutable, so they cache for a year. */
export async function GET(_request: Request, { params }: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await params;

  if (!isAllowedFolder(folder) || !isSafeFilename(filename) || !isDbConfigured()) return notFound();

  try {
    await connectDB();
    const upload = await StoredUpload.findOne({ folder, filename }).lean();
    if (!upload) return notFound();

    const raw = upload.data as unknown as Buffer | { buffer: ArrayBuffer };
    const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from((raw as { buffer: ArrayBuffer }).buffer);

    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[uploads] read failed", error);
    return new Response("Unable to load image", { status: 500 });
  }
}
