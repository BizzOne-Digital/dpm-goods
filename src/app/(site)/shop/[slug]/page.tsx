import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import ProductGallery from "@/components/shop/ProductGallery";
import AddToCartPanel from "@/components/shop/AddToCartPanel";
import ProductCard from "@/components/shop/ProductCard";
import { Breadcrumbs, SectionHeading, StarRating } from "@/components/ui/Primitives";
import { getCategories, getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { normalizeImageUrl } from "@/lib/image-url";
import { textToHtml } from "@/lib/sanitize";
import { buildMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: "Product not found", path: `/shop/${slug}`, noIndex: true });
  return buildMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || `Shop ${product.name} at DPM Goods.`,
    path: `/shop/${product.slug}`,
    image: product.featuredImage || product.images[0],
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [{ t }, related, settings, categories] = await Promise.all([getDictionary(), getRelatedProducts(product), getSettings(), getCategories()]);
  const category = categories.find((c) => c.slug === product.category);
  const gallery = [...new Set([product.featuredImage, ...product.images].filter(Boolean) as string[])];
  const stockLabel = product.stock <= 0 ? t.product.outOfStock : product.stock <= 5 ? t.product.lowStock : t.product.inStock;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    image: gallery.map((g) => {
      const u = normalizeImageUrl(g);
      return u.startsWith("http") ? u : siteUrl(u);
    }),
    brand: { "@type": "Brand", name: "DPM Goods" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: settings.currency,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: siteUrl(`/shop/${product.slug}`),
    },
    ...(product.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x py-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.nav.shop, href: "/shop" },
            ...(category ? [{ label: category.name, href: category.href || `/shop?category=${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={gallery} name={product.name} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            {category && <p className="eyebrow">{category.name}</p>}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <StarRating value={product.rating} />
              <span>
                {product.rating.toFixed(1)} ({product.reviewCount} {t.product.reviews})
              </span>
            </div>
            {product.shortDescription && <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{product.shortDescription}</p>}

            <div className="mt-6">
              <AddToCartPanel product={product} />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-cream p-4 text-sm">
              {product.sku && (
                <div>
                  <dt className="text-muted">{t.product.sku}</dt>
                  <dd className="font-semibold">{product.sku}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">{t.product.availability}</dt>
                <dd className={product.stock > 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>{stockLabel}</dd>
              </div>
              {category && (
                <div>
                  <dt className="text-muted">{t.product.category}</dt>
                  <dd className="font-semibold">{category.name}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 divide-y divide-line rounded-xl border border-line">
              <details className="group p-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {t.product.description}
                  <span className="text-xl leading-none text-muted transition group-open:rotate-45">+</span>
                </summary>
                <div className="prose-dpm mt-3 text-sm" dangerouslySetInnerHTML={{ __html: textToHtml(product.description || product.shortDescription) }} />
              </details>
              <details className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" aria-hidden="true" /> {t.product.shippingInfo}</span>
                  <span className="text-xl leading-none text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">{settings.shippingText}</p>
              </details>
              <details className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" aria-hidden="true" /> {t.product.returnsInfo}</span>
                  <span className="text-xl leading-none text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">{settings.returnsText}</p>
              </details>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> {t.checkout.secure}
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 sm:mt-20" aria-label={t.product.related}>
            <SectionHeading title={t.product.related} linkText={t.home.viewAllProducts} linkHref="/shop" />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
