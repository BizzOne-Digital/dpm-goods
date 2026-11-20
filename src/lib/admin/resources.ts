/**
 * Admin resource definitions (client-safe: no server imports).
 * One config drives the admin table, the form and the server-side validation.
 */
import { BOOKING_STATUSES, CONTENT_PAGES, GENDERS, type UploadFolder } from "@/lib/constants";

export type FieldType =
  | "text"
  | "email"
  | "slug"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "tags"
  | "image"
  | "gallery"
  | "date"
  | "json";

export type FieldDef = {
  name: string; // dotted paths allowed, e.g. "socialLinks.instagram"
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  optionsFrom?: "categories";
  folder?: UploadFolder;
  slugFrom?: string;
  featuredField?: string; // gallery: field that stores the featured image
  help?: string;
  half?: boolean;
  section?: string;
  max?: number;
  defaultValue?: unknown;
};

export type ColumnDef = {
  name: string;
  label: string;
  kind?: "text" | "image" | "boolean" | "status" | "price" | "date" | "rating";
};

export type ResourceConfig = {
  key: string;
  label: string;
  singular: string;
  description: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  searchFields: string[];
  defaultSort: Record<string, 1 | -1>;
  sortable?: boolean; // uses sortOrder + up/down controls
  canCreate?: boolean;
  canDuplicate?: boolean;
  previewPath?: (doc: Record<string, unknown>) => string | null;
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
  quickActions?: { label: string; patch: Record<string, unknown>; tone?: "primary" | "danger" }[];
  emptyText: string;
};

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

export const RESOURCES: Record<string, ResourceConfig> = {
  products: {
    key: "products",
    label: "Products",
    singular: "Product",
    description: "Manage catalog items, pricing, inventory and imagery.",
    canCreate: true,
    canDuplicate: true,
    previewPath: (d) => (d.slug ? `/shop/${d.slug}` : null),
    searchFields: ["name", "sku", "slug", "tags"],
    defaultSort: { createdAt: -1 },
    emptyText: "No products found.",
    filters: [
      { name: "gender", label: "Gender", options: opts(GENDERS) },
      { name: "published", label: "Status", options: [{ value: "true", label: "Published" }, { value: "false", label: "Draft" }] },
    ],
    columns: [
      { name: "featuredImage", label: "", kind: "image" },
      { name: "name", label: "Product" },
      { name: "category", label: "Category" },
      { name: "price", label: "Price", kind: "price" },
      { name: "stock", label: "Stock" },
      { name: "bestSeller", label: "Bestseller", kind: "boolean" },
      { name: "featured", label: "Featured", kind: "boolean" },
      { name: "newArrival", label: "New", kind: "boolean" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "name", label: "Product name", type: "text", required: true, section: "Basics", max: 160 },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "name", half: true, help: "Leave blank to generate from the name." },
      { name: "sku", label: "SKU", type: "text", half: true, max: 60 },
      { name: "shortDescription", label: "Short description", type: "textarea", max: 400 },
      { name: "description", label: "Full description", type: "richtext" },
      { name: "category", label: "Category", type: "select", optionsFrom: "categories", required: true, half: true, section: "Organization" },
      { name: "subCategory", label: "Sub-category", type: "text", half: true, max: 80 },
      { name: "gender", label: "Gender", type: "select", options: opts(GENDERS), required: true, half: true, defaultValue: "unisex" },
      { name: "tags", label: "Tags", type: "tags", half: true },
      { name: "price", label: "Price", type: "number", required: true, half: true, section: "Pricing & Inventory" },
      { name: "compareAtPrice", label: "Compare-at price", type: "number", half: true, help: "Shows a strikethrough price and discount badge." },
      { name: "costPrice", label: "Cost price (private)", type: "number", half: true },
      { name: "stock", label: "Stock quantity", type: "number", half: true, defaultValue: 0 },
      { name: "sizes", label: "Sizes", type: "tags", half: true, help: "e.g. S, M, L or 8, 9, 10" },
      { name: "colors", label: "Colors", type: "tags", half: true },
      { name: "images", label: "Gallery", type: "gallery", folder: "products", featuredField: "featuredImage", section: "Images" },
      { name: "featured", label: "Featured", type: "boolean", half: true, section: "Visibility" },
      { name: "bestSeller", label: "Bestseller", type: "boolean", half: true },
      { name: "newArrival", label: "New arrival", type: "boolean", half: true },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "rating", label: "Rating (0-5)", type: "number", half: true, defaultValue: 5 },
      { name: "reviewCount", label: "Review count", type: "number", half: true, defaultValue: 0 },
      { name: "seoTitle", label: "SEO title", type: "text", section: "SEO", max: 70 },
      { name: "seoDescription", label: "SEO description", type: "textarea", max: 170 },
    ],
  },
  categories: {
    key: "categories",
    label: "Categories",
    singular: "Category",
    description: "Homepage category cards and shop filters.",
    canCreate: true,
    sortable: true,
    searchFields: ["name", "slug"],
    defaultSort: { sortOrder: 1 },
    emptyText: "No categories yet.",
    columns: [
      { name: "image", label: "", kind: "image" },
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "href", label: "Link" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true, max: 80 },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "name", half: true },
      { name: "description", label: "Description", type: "textarea", max: 300 },
      { name: "href", label: "Card link", type: "text", help: "Optional. Defaults to /shop?category=slug (e.g. /men).", max: 200 },
      { name: "image", label: "Image", type: "image", folder: "pages" },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, defaultValue: 0 },
    ],
  },
  blog: {
    key: "blog",
    label: "Blog",
    singular: "Post",
    description: "Articles for the blog and homepage preview.",
    canCreate: true,
    canDuplicate: true,
    previewPath: (d) => (d.slug ? `/blog/${d.slug}` : null),
    searchFields: ["title", "slug", "category"],
    defaultSort: { publishedAt: -1, createdAt: -1 },
    emptyText: "No blog posts have been published.",
    columns: [
      { name: "featuredImage", label: "", kind: "image" },
      { name: "title", label: "Title" },
      { name: "category", label: "Category" },
      { name: "publishedAt", label: "Published", kind: "date" },
      { name: "published", label: "Live", kind: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 160 },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "title", half: true },
      { name: "category", label: "Category", type: "text", half: true, help: "e.g. Style Tips, Fashion Trends, Sneakers", max: 60 },
      { name: "excerpt", label: "Excerpt", type: "textarea", max: 400 },
      { name: "content", label: "Content", type: "richtext" },
      { name: "featuredImage", label: "Featured image", type: "image", folder: "pages" },
      { name: "author", label: "Author", type: "text", half: true, defaultValue: "Universal UPM Goods Editorial", max: 80 },
      { name: "tags", label: "Tags", type: "tags", half: true },
      { name: "published", label: "Published", type: "boolean", half: true },
      { name: "publishedAt", label: "Publish date", type: "date", half: true },
      { name: "seoTitle", label: "SEO title", type: "text", section: "SEO", max: 70 },
      { name: "seoDescription", label: "SEO description", type: "textarea", max: 170 },
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Customer reviews shown on the homepage and reviews page.",
    canCreate: true,
    sortable: true,
    searchFields: ["name", "review"],
    defaultSort: { sortOrder: 1 },
    emptyText: "No testimonials yet.",
    columns: [
      { name: "avatar", label: "", kind: "image" },
      { name: "name", label: "Customer" },
      { name: "rating", label: "Rating", kind: "rating" },
      { name: "review", label: "Review" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "name", label: "Customer name", type: "text", required: true, half: true, max: 80 },
      { name: "rating", label: "Rating (1-5)", type: "number", required: true, half: true, defaultValue: 5 },
      { name: "review", label: "Review", type: "textarea", required: true, max: 800 },
      { name: "avatar", label: "Photo / avatar", type: "image", folder: "gallery" },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, defaultValue: 0 },
    ],
  },
  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    description: "People shown on the Our Team page.",
    canCreate: true,
    sortable: true,
    searchFields: ["name", "role"],
    defaultSort: { sortOrder: 1 },
    emptyText: "No team members yet.",
    columns: [
      { name: "photo", label: "", kind: "image" },
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true, max: 80 },
      { name: "role", label: "Role", type: "text", required: true, half: true, max: 80 },
      { name: "bio", label: "Bio", type: "textarea", max: 600 },
      { name: "photo", label: "Photo", type: "image", folder: "gallery" },
      { name: "socialLinks.instagram", label: "Instagram URL", type: "text", half: true, section: "Social links", max: 200 },
      { name: "socialLinks.linkedin", label: "LinkedIn URL", type: "text", half: true, max: 200 },
      { name: "socialLinks.email", label: "Email", type: "email", half: true },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, defaultValue: 0 },
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    description: "Questions shown on the FAQ and pricing pages.",
    canCreate: true,
    sortable: true,
    searchFields: ["question", "answer", "category"],
    defaultSort: { sortOrder: 1 },
    emptyText: "No FAQs yet.",
    columns: [
      { name: "question", label: "Question" },
      { name: "category", label: "Category" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, max: 250 },
      { name: "answer", label: "Answer", type: "textarea", required: true, max: 2000 },
      { name: "category", label: "Category", type: "text", half: true, defaultValue: "General", max: 60 },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, defaultValue: 0 },
      { name: "published", label: "Published", type: "boolean", defaultValue: true },
    ],
  },
  pages: {
    key: "pages",
    label: "Pages",
    singular: "Page section",
    description: "Editable copy and images for Home, About, Services, Pricing, Contact, Booking, Team and legal pages.",
    canCreate: true,
    searchFields: ["page", "sectionKey", "title"],
    defaultSort: { page: 1, sortOrder: 1 },
    emptyText: "No page sections saved yet. Defaults are shown on the site until you create one.",
    filters: [{ name: "page", label: "Page", options: opts(CONTENT_PAGES) }],
    columns: [
      { name: "image", label: "", kind: "image" },
      { name: "page", label: "Page" },
      { name: "sectionKey", label: "Section" },
      { name: "title", label: "Title" },
      { name: "enabled", label: "Enabled", kind: "boolean" },
    ],
    fields: [
      { name: "page", label: "Page", type: "select", options: opts(CONTENT_PAGES), required: true, half: true },
      { name: "sectionKey", label: "Section key", type: "text", required: true, half: true, help: "e.g. hero, about, story, mission, newsletter, privacy-policy", max: 60 },
      { name: "title", label: "Title", type: "text", max: 200 },
      { name: "subtitle", label: "Subtitle / label", type: "text", max: 200 },
      { name: "description", label: "Description / body", type: "richtext", help: "Plain paragraphs or rich text (legal pages use rich text)." },
      { name: "image", label: "Image", type: "image", folder: "pages" },
      { name: "ctaText", label: "Button text", type: "text", half: true, max: 60 },
      { name: "ctaUrl", label: "Button link", type: "text", half: true, max: 200 },
      { name: "enabled", label: "Enabled", type: "boolean", half: true, defaultValue: true },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, defaultValue: 0 },
      { name: "metadata", label: "Extra settings (JSON)", type: "json", help: "Advanced: secondary image/CTA, service items, pricing plans, stats." },
    ],
  },
  promotions: {
    key: "promotions",
    label: "Promotions",
    singular: "Promotion",
    description: "Homepage promo banner and checkout promo codes.",
    canCreate: true,
    searchFields: ["title", "code"],
    defaultSort: { updatedAt: -1 },
    emptyText: "No promotions yet.",
    columns: [
      { name: "image", label: "", kind: "image" },
      { name: "title", label: "Title" },
      { name: "discountText", label: "Banner" },
      { name: "code", label: "Code" },
      { name: "enabled", label: "Enabled", kind: "boolean" },
    ],
    fields: [
      { name: "label", label: "Small label", type: "text", half: true, defaultValue: "Limited-Time Offer", section: "Banner", max: 60 },
      { name: "title", label: "Title", type: "text", required: true, half: true, max: 100 },
      { name: "subtitle", label: "Subtitle", type: "text", max: 200 },
      { name: "discountLabel", label: "Discount label", type: "text", half: true, defaultValue: "Up to", max: 30 },
      { name: "discountText", label: "Discount text", type: "text", half: true, help: "e.g. 30% OFF", max: 30 },
      { name: "ctaText", label: "Button text", type: "text", half: true, max: 40 },
      { name: "ctaUrl", label: "Destination URL", type: "text", half: true, max: 200 },
      { name: "image", label: "Background image", type: "image", folder: "pages" },
      { name: "placement", label: "Placement", type: "select", options: [{ value: "home", label: "Homepage" }, { value: "none", label: "Code only (no banner)" }], half: true, defaultValue: "home" },
      { name: "enabled", label: "Enabled", type: "boolean", half: true, defaultValue: true },
      { name: "code", label: "Promo code", type: "text", half: true, section: "Checkout code (optional)", max: 40 },
      { name: "discountType", label: "Discount type", type: "select", options: [{ value: "percent", label: "Percent" }, { value: "fixed", label: "Fixed amount" }], half: true, defaultValue: "percent" },
      { name: "discountValue", label: "Discount value", type: "number", half: true, defaultValue: 0 },
      { name: "minSubtotal", label: "Minimum order", type: "number", half: true, defaultValue: 0 },
      { name: "startsAt", label: "Starts", type: "date", half: true },
      { name: "endsAt", label: "Ends", type: "date", half: true },
    ],
  },
  bookings: {
    key: "bookings",
    label: "Bookings",
    singular: "Booking",
    description: "Styling sessions and consultation requests.",
    canCreate: true,
    searchFields: ["name", "email", "bookingType"],
    defaultSort: { createdAt: -1 },
    emptyText: "No bookings found.",
    filters: [{ name: "status", label: "Status", options: opts(BOOKING_STATUSES) }],
    quickActions: [
      { label: "Confirm", patch: { status: "confirmed" }, tone: "primary" },
      { label: "Complete", patch: { status: "completed" } },
      { label: "Cancel", patch: { status: "cancelled" }, tone: "danger" },
    ],
    columns: [
      { name: "name", label: "Name" },
      { name: "bookingType", label: "Service" },
      { name: "date", label: "Date" },
      { name: "time", label: "Time" },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true, max: 100 },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone", type: "text", half: true, max: 40 },
      { name: "bookingType", label: "Service", type: "text", required: true, half: true, max: 120 },
      { name: "date", label: "Date (YYYY-MM-DD)", type: "text", required: true, half: true, max: 10 },
      { name: "time", label: "Time (HH:MM)", type: "text", required: true, half: true, max: 5 },
      { name: "status", label: "Status", type: "select", options: opts(BOOKING_STATUSES), required: true, defaultValue: "pending" },
      { name: "message", label: "Customer message", type: "textarea", max: 2000 },
      { name: "adminNotes", label: "Internal notes", type: "textarea", max: 2000 },
    ],
  },
  messages: {
    key: "messages",
    label: "Messages",
    singular: "Message",
    description: "Contact form submissions.",
    searchFields: ["name", "email", "subject", "message"],
    defaultSort: { createdAt: -1 },
    emptyText: "No messages yet.",
    filters: [{ name: "status", label: "Status", options: opts(["new", "read", "resolved"]) }],
    quickActions: [
      { label: "Mark read", patch: { status: "read" } },
      { label: "Resolve", patch: { status: "resolved" }, tone: "primary" },
    ],
    columns: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email" },
      { name: "subject", label: "Subject" },
      { name: "createdAt", label: "Received", kind: "date" },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true, max: 100 },
      { name: "email", label: "Email", type: "email", required: true, half: true },
      { name: "phone", label: "Phone", type: "text", half: true, max: 40 },
      { name: "subject", label: "Subject", type: "text", half: true, max: 150 },
      { name: "message", label: "Message", type: "textarea", required: true, max: 3000 },
      { name: "status", label: "Status", type: "select", options: opts(["new", "read", "resolved"]), required: true, defaultValue: "new" },
    ],
  },
};

/** Website Settings (singleton) form + validation. */
export const SETTINGS_CONFIG: ResourceConfig = {
  key: "settings",
  label: "Website Settings",
  singular: "Settings",
  description: "Brand, contact details, social links, shipping and SEO defaults.",
  searchFields: [],
  defaultSort: {},
  columns: [],
  emptyText: "",
  fields: [
    { name: "siteName", label: "Site name", type: "text", required: true, half: true, section: "Brand", max: 60 },
    { name: "companyName", label: "Company name", type: "text", required: true, half: true, max: 120 },
    { name: "logo", label: "Logo (replaces the text logo)", type: "image", folder: "misc", half: true },
    { name: "favicon", label: "Favicon", type: "image", folder: "misc", half: true },
    { name: "announcementText", label: "Announcement bar text", type: "text", max: 200, section: "Announcement bar" },
    { name: "announcementEnabled", label: "Show announcement bar", type: "boolean" },
    { name: "email", label: "Support email", type: "email", half: true, section: "Contact" },
    { name: "phone", label: "Phone", type: "text", half: true, max: 40 },
    { name: "address", label: "Address", type: "text", max: 200 },
    { name: "instagram", label: "Instagram URL", type: "text", half: true, section: "Social", max: 200 },
    { name: "facebook", label: "Facebook URL", type: "text", half: true, max: 200 },
    { name: "tiktok", label: "TikTok URL", type: "text", half: true, max: 200 },
    { name: "youtube", label: "YouTube URL", type: "text", half: true, max: 200 },
    { name: "currency", label: "Currency (ISO code)", type: "select", options: ["USD", "CAD", "EUR", "GBP"].map((c) => ({ value: c, label: c })), half: true, required: true, section: "Store" },
    { name: "defaultLanguage", label: "Default language", type: "select", options: [{ value: "en", label: "English" }, { value: "es", label: "Spanish" }], half: true, required: true },
    { name: "flatShippingRate", label: "Flat shipping rate", type: "number", half: true },
    { name: "freeShippingThreshold", label: "Free shipping over (0 = never)", type: "number", half: true },
    { name: "taxRate", label: "Tax rate % (0 = none)", type: "number", half: true },
    { name: "bookingTypes", label: "Booking services", type: "tags", half: true, help: "Options shown on the booking form." },
    { name: "shippingText", label: "Shipping policy text", type: "textarea", max: 2000, section: "Policies" },
    { name: "returnsText", label: "Returns policy text", type: "textarea", max: 2000 },
    { name: "footerDescription", label: "Footer description", type: "textarea", max: 400 },
    { name: "seoTitle", label: "Default SEO title", type: "text", max: 70, section: "SEO" },
    { name: "seoDescription", label: "Default SEO description", type: "textarea", max: 170 },
  ],
};

export function getResource(key: string): ResourceConfig | undefined {
  return Object.prototype.hasOwnProperty.call(RESOURCES, key) ? RESOURCES[key] : undefined;
}
