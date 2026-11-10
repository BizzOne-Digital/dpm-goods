import { connectDB } from "@/lib/mongodb";
import { fail, handleApiError, ok, readJson } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { bookingSchema } from "@/lib/validation";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, "booking"), 5)) return fail("Too many requests. Please try again shortly.", 429);
    const data = bookingSchema.parse(await readJson(request));
    const today = new Date().toISOString().slice(0, 10);
    if (data.date < today) return fail("Please choose a future date.", 422, { date: "Please choose a future date." });
    await connectDB();
    const clash = await Booking.exists({ date: data.date, time: data.time, status: { $in: ["pending", "confirmed"] } });
    if (clash) return fail("That time slot was just taken. Please choose another time.", 409, { time: "Slot unavailable" });
    await Booking.create({ ...data, status: "pending" });
    return ok({}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
