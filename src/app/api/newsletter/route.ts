import { connectDB } from "@/lib/mongodb";
import { handleApiError, ok, fail, readJson } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "newsletter"), 5)) return fail("Too many requests. Please try again shortly.", 429);
    const { email } = newsletterSchema.parse(await readJson(request));
    await connectDB();
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return ok({ duplicate: false });
      }
      return ok({ duplicate: true });
    }
    await NewsletterSubscriber.create({ email, source: "website" });
    return ok({ duplicate: false }, 201);
  } catch (error) {
    // Unique index race: treat as already subscribed.
    if ((error as { code?: number })?.code === 11000) return ok({ duplicate: true });
    return handleApiError(error);
  }
}
