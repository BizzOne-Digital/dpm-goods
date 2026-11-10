import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, ok } from "@/lib/api";
import { escapeRegex, isValidObjectId } from "@/lib/utils";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

export const runtime = "nodejs";

/** List subscribers, or export CSV with ?format=csv */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim();
    const query = q ? { email: new RegExp(escapeRegex(q.slice(0, 80)), "i") } : {};
    await connectDB();

    if (url.searchParams.get("format") === "csv") {
      const all = await NewsletterSubscriber.find({ active: true }).sort({ createdAt: -1 }).lean();
      const csv = ["email,source,subscribed_at", ...all.map((s) => `"${s.email.replace(/"/g, '""')}",${s.source ?? ""},${new Date(s.createdAt).toISOString()}`)].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dpm-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = 25;
    const [items, total] = await Promise.all([
      NewsletterSubscriber.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      NewsletterSubscriber.countDocuments(query),
    ]);
    return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!isValidObjectId(id)) throw new ApiError("Invalid id", 400);
    await connectDB();
    await NewsletterSubscriber.findByIdAndDelete(id);
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
