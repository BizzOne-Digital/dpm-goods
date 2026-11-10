import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok } from "@/lib/api";
import { countUploadReferences } from "@/lib/uploads";
import { isValidObjectId } from "@/lib/utils";
import StoredUpload from "@/models/StoredUpload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Reference count, so the UI can warn before deleting an image that is still in use. */
export async function GET(_request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    await connectDB();
    const upload = await StoredUpload.findById(id).select("folder filename").lean();
    if (!upload) throw new ApiError("Not found", 404);
    const references = await countUploadReferences(`/api/uploads/${upload.folder}/${upload.filename}`);
    return ok({ references });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Deletes an upload. If still referenced, requires ?force=1. */
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    await connectDB();
    const upload = await StoredUpload.findById(id).select("folder filename").lean();
    if (!upload) throw new ApiError("Not found", 404);
    const force = new URL(request.url).searchParams.get("force") === "1";
    if (!force) {
      const references = await countUploadReferences(`/api/uploads/${upload.folder}/${upload.filename}`);
      if (references > 0) throw new ApiError(`This image is used in ${references} place(s). Confirm to delete anyway.`, 409);
    }
    await StoredUpload.deleteOne({ _id: id });
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
