/**
 * Copies the current demo image paths (src/lib/demo-data.ts) onto already-seeded records.
 *   npm run apply-images
 * Only updates demo products/categories/page sections by their slug/key.
 */
import mongoose from "mongoose";
import { defaultSections, demoCategories, demoProducts, demoPromotion } from "../src/lib/demo-data";
import { Category, PageContent, Product, Promotion } from "../src/models";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  let n = 0;
  for (const p of demoProducts) n += (await Product.updateOne({ slug: p.slug }, { images: p.images, featuredImage: p.images[0] })).modifiedCount;
  for (const c of demoCategories) n += (await Category.updateOne({ slug: c.slug }, { image: c.image })).modifiedCount;
  for (const s of defaultSections) {
    const set: Record<string, unknown> = { image: s.image };
    if (s.metadata?.secondaryImage) set["metadata.secondaryImage"] = s.metadata.secondaryImage;
    n += (await PageContent.updateOne({ page: s.page, sectionKey: s.sectionKey }, { $set: set })).modifiedCount;
  }
  n += (await Promotion.updateOne({ code: demoPromotion.code }, { image: demoPromotion.image })).modifiedCount;
  console.log(`Updated ${n} records.`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
