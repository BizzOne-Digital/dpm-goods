// Plain (serialized) shapes passed from server to client components.

export type Product = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  sku?: string;
  category: string;
  subCategory?: string;
  gender: "men" | "women" | "unisex";
  price: number;
  compareAtPrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  featuredImage?: string;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  salesCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  href?: string;
  published: boolean;
  sortOrder: number;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags: string[];
  author?: string;
  published: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Testimonial = {
  _id: string;
  name: string;
  avatar?: string;
  rating: number;
  review: string;
  published: boolean;
  sortOrder: number;
};

export type TeamMember = {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  socialLinks?: { instagram?: string; linkedin?: string; email?: string };
  published: boolean;
  sortOrder: number;
};

export type FAQItem = {
  _id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  sortOrder: number;
};

export type PageSection = {
  _id?: string;
  page: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
  enabled: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
};

export type Promotion = {
  _id?: string;
  label?: string;
  title: string;
  subtitle?: string;
  discountText?: string;
  discountLabel?: string;
  ctaText?: string;
  ctaUrl?: string;
  image?: string;
  enabled: boolean;
  placement: string;
  code?: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotal: number;
};

export type SiteSettings = {
  siteName: string;
  companyName: string;
  logo?: string;
  favicon?: string;
  announcementText: string;
  announcementEnabled: boolean;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  currency: string;
  defaultLanguage: string;
  shippingText?: string;
  returnsText?: string;
  footerDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  taxRate: number;
  bookingTypes: string[];
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  shippingAddress: Record<string, string>;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  promoCode?: string;
  status: string;
  paymentProvider: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory: Array<{ status: string; at: string; note?: string }>;
  createdAt: string;
};

export type Address = {
  _id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
};

export type ApiResponse<T = unknown> =
  | ({ success: true } & T)
  | { success: false; message: string; errors?: Record<string, string> };
