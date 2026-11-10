import { connectDB } from "@/lib/mongodb";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";
import ContactMessage from "@/models/ContactMessage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "contact"), 5)) return fail("Too many messages. Please try again shortly.", 429);
    const data = contactSchema.parse(await readJson(request));
    await connectDB();
    await ContactMessage.create(data);
    return ok({}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
