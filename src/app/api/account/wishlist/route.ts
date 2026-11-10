import { z } from "zod";
import { getCustomerSession, requireCustomer } from "@/lib/auth";
import { handleApiError, ok, readJson } from "@/lib/api";
import { isDbConfigured } from "@/lib/mongodb";
import { isValidObjectId } from "@/lib/utils";
import Product from "@/models/Product";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await getCustomerSession()) || !isDbConfigured()) return ok({ items: [] });
    const session = await requireCustomer();
    const user = await User.findById(session.sub).select("wishlist").lean();
    const ids = (user?.wishlist ?? []).filter(isValidObjectId);
    const products = await Product.find({ _id: { $in: ids }, published: true }).select("name slug price images featuredImage").lean();
    const items = products.map((p) => ({
      productId: String(p._id),
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.featuredImage || p.images?.[0],
    }));
    return ok({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireCustomer();
    const { productIds } = z.object({ productIds: z.array(z.string().max(60)).max(200) }).parse(await readJson(request));
    await User.updateOne({ _id: session.sub }, { wishlist: [...new Set(productIds.filter(isValidObjectId))] });
    return ok();
  } catch (error) {
    return handleApiError(error);
  }
}
