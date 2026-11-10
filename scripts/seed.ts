/**
 * Seeds demo content and the first admin.
 *   npm run seed            -> insert demo data (skips anything that already exists)
 *   npm run seed -- --clear -> remove the demo records created by this script
 *
 * Reads MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD from .env.local / environment.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  defaultSections,
  defaultSettings,
  demoBlogPosts,
  demoCategories,
  demoFaqs,
  demoProducts,
  demoPromotion,
  demoTeam,
  demoTestimonials,
} from "../src/lib/demo-data";
import { Admin, BlogPost, Category, FAQ, PageContent, Product, Promotion, TeamMember, Testimonial, WebsiteSettings } from "../src/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Add it to .env.local first.");
  await mongoose.connect(uri);
  const clear = process.argv.includes("--clear");

  if (clear) {
    const r = await Promise.all([
      Product.deleteMany({ slug: { $in: demoProducts.map((p) => p.slug) } }),
      Category.deleteMany({ slug: { $in: demoCategories.map((c) => c.slug) } }),
      BlogPost.deleteMany({ slug: { $in: demoBlogPosts.map((b) => b.slug) } }),
      Testimonial.deleteMany({ name: { $in: demoTestimonials.map((t) => t.name) } }),
      TeamMember.deleteMany({ name: { $in: demoTeam.map((t) => t.name) } }),
      FAQ.deleteMany({ question: { $in: demoFaqs.map((f) => f.question) } }),
      Promotion.deleteMany({ code: demoPromotion.code }),
    ]);
    console.log(`Removed demo records: ${r.reduce((n, x) => n + x.deletedCount, 0)}`);
    await mongoose.disconnect();
    return;
  }

  // Upsert by natural key without overwriting edits the team already made.
  const upsert = async <T extends Record<string, unknown>>(model: mongoose.Model<any>, key: keyof T, docs: T[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let created = 0;
    for (const doc of docs) {
      const res = await model.updateOne({ [key]: doc[key] }, { $setOnInsert: doc }, { upsert: true });
      created += res.upsertedCount;
    }
    console.log(`${model.modelName}: ${created} created, ${docs.length - created} already existed`);
  };

  await upsert(Category, "slug", demoCategories as Record<string, unknown>[]);
  await upsert(Product, "slug", demoProducts as unknown as Record<string, unknown>[]);
  await upsert(BlogPost, "slug", demoBlogPosts.map((b) => ({ ...b, publishedAt: b.publishedAt ? new Date(b.publishedAt) : new Date() })) as Record<string, unknown>[]);
  await upsert(Testimonial, "name", demoTestimonials as Record<string, unknown>[]);
  await upsert(TeamMember, "name", demoTeam as Record<string, unknown>[]);
  await upsert(FAQ, "question", demoFaqs as Record<string, unknown>[]);
  await upsert(Promotion, "code", [demoPromotion] as Record<string, unknown>[]);

  let sections = 0;
  for (const s of defaultSections) {
    const res = await PageContent.updateOne({ page: s.page, sectionKey: s.sectionKey }, { $setOnInsert: s }, { upsert: true });
    sections += res.upsertedCount;
  }
  console.log(`PageContent: ${sections} created`);

  if (!(await WebsiteSettings.exists({}))) {
    await WebsiteSettings.create(defaultSettings);
    console.log("WebsiteSettings: created");
  }

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 8) throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    if (await Admin.exists({ email })) {
      console.log("Admin: already exists (password unchanged)");
    } else {
      await Admin.create({ name: "Store Owner", email, passwordHash: await bcrypt.hash(password, 12), role: "owner" });
      console.log(`Admin: created ${email}`);
    }
  } else {
    console.log("Admin: skipped (set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one)");
  }

  await mongoose.disconnect();
  console.log("Seed complete.");
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
