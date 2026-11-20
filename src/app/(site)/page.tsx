import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import Benefits from "@/components/home/Benefits";
import AboutSplit from "@/components/home/AboutSplit";
import PromoBanner from "@/components/home/PromoBanner";
import Testimonials from "@/components/home/Testimonials";
import NewsletterSection from "@/components/home/NewsletterSection";
import BestSellersTabs from "@/components/shop/BestSellersTabs";
import BlogCard from "@/components/blog/BlogCard";
import { FaqPreview, GenderBanners, Lookbook, NewArrivals, StatsBand, TrustStrip } from "@/components/home/MoreSections";
import { EmptyState, SectionHeading } from "@/components/ui/Primitives";
import {
  getActivePromotion,
  getBlogPosts,
  getCategories,
  getFaqs,
  getProducts,
  getSections,
  getSettings,
  getTestimonials,
} from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: settings.seoTitle || "Universal UPM Goods | Men's & Women's Fashion",
    description: settings.seoDescription,
    path: "/",
  });
}

export default async function HomePage() {
  const [{ t }, sections, categories, products, promo, testimonials, posts, faqs] = await Promise.all([
    getDictionary(),
    getSections("home"),
    getCategories(),
    getProducts({ limit: 40, sort: "best-selling" }),
    getActivePromotion("home"),
    getTestimonials(),
    getBlogPosts(3),
    getFaqs(),
  ]);
  const newArrivals = products.items.filter((p) => p.newArrival);

  const hero = sections.hero?.enabled !== false ? sections.hero : undefined;
  const about = sections.about?.enabled !== false ? sections.about : undefined;
  const newsletter = sections.newsletter?.enabled !== false ? sections.newsletter : undefined;

  return (
    <>
      {hero && <Hero section={hero} t={t} />}

      <TrustStrip t={t} />

      <CategoryGrid categories={categories} title={t.home.shopByCategory} linkText={t.home.exploreCollections} />

      <section className="container-x pb-14" aria-label={t.home.bestSellers}>
        {products.items.length ? (
          <BestSellersTabs products={products.items} />
        ) : (
          <EmptyState title={t.product.noProducts} description="Add products from the admin dashboard to populate this section." />
        )}
      </section>

      <GenderBanners t={t} />

      <Benefits t={t} />

      <NewArrivals products={newArrivals} t={t} />

      {about && <AboutSplit section={about} />}

      {promo && <PromoBanner promo={promo} />}

      <Lookbook t={t} />

      <Testimonials items={testimonials} title={t.home.whatCustomersSay} />

      <StatsBand t={t} />

      {posts.length > 0 && (
        <section className="container-x pb-14" aria-label={t.home.fromBlog}>
          <SectionHeading title={t.home.fromBlog} linkText={t.home.viewAllArticles} linkHref="/blog" />
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} readMore={t.common.readMore} />
            ))}
          </div>
        </section>
      )}

      <FaqPreview faqs={faqs} t={t} />

      {newsletter && <NewsletterSection section={newsletter} />}
    </>
  );
}
