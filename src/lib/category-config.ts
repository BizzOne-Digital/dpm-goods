import type { CategoryConfig } from "@/components/shop/CategoryPage";

export const CATEGORY_PAGES: Record<string, CategoryConfig> = {
  men: {
    path: "/men",
    categorySlug: "men-clothing",
    title: "Men's Fashion",
    tagline: "Smart-casual essentials, outerwear, denim and sneakers for men.",
    preset: { gender: "men" },
    related: [
      { label: "Jackets & Blazers", href: "/men?q=jacket" },
      { label: "Jeans", href: "/jeans?gender=men" },
      { label: "Sneakers", href: "/sneakers?gender=men" },
      { label: "Accessories", href: "/accessories?gender=men" },
    ],
  },
  women: {
    path: "/women",
    categorySlug: "women-clothing",
    title: "Women's Fashion",
    tagline: "Elevated neutrals, knitwear, coats and dresses for women.",
    preset: { gender: "women" },
    related: [
      { label: "Dresses", href: "/dresses" },
      { label: "Coats", href: "/women?q=coat" },
      { label: "Knitwear", href: "/women?q=knit" },
      { label: "Accessories", href: "/accessories?gender=women" },
    ],
  },
  sneakers: {
    path: "/sneakers",
    categorySlug: "sneakers",
    title: "Sneakers",
    tagline: "Premium lifestyle sneakers built for everyday wear.",
    preset: { category: "sneakers" },
    related: [
      { label: "Men's Sneakers", href: "/sneakers?gender=men" },
      { label: "Women's Sneakers", href: "/sneakers?gender=women" },
      { label: "New Arrivals", href: "/sneakers?new=1" },
    ],
  },
  jeans: {
    path: "/jeans",
    categorySlug: "jeans",
    title: "Jeans",
    tagline: "Slim, straight and relaxed denim in modern washes.",
    preset: { category: "jeans" },
    related: [
      { label: "Men's Jeans", href: "/jeans?gender=men" },
      { label: "Women's Jeans", href: "/jeans?gender=women" },
      { label: "Denim Dresses", href: "/dresses?q=denim" },
    ],
  },
  dresses: {
    path: "/dresses",
    categorySlug: "dresses",
    title: "Dresses",
    tagline: "Satin, denim and day dresses for every occasion.",
    preset: { category: "dresses" },
    related: [
      { label: "Satin & Evening", href: "/dresses?q=satin" },
      { label: "Day Dresses", href: "/dresses?q=denim" },
      { label: "On Sale", href: "/dresses?sale=1" },
    ],
  },
  accessories: {
    path: "/accessories",
    categorySlug: "accessories",
    title: "Accessories",
    tagline: "Sunglasses, watches, belts and the finishing touches.",
    preset: { category: "accessories" },
    related: [
      { label: "Sunglasses", href: "/accessories?q=sunglasses" },
      { label: "Watches", href: "/accessories?q=watch" },
      { label: "Leather Goods", href: "/accessories?q=leather" },
    ],
  },
};
