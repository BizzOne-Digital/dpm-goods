export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const GENDERS = ["men", "women", "unisex"] as const;

export const CONTENT_PAGES = ["home", "about", "services", "pricing", "contact", "booking", "team", "legal"] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "7", "8", "9", "10", "11", "12", "One Size"];

export const ADMIN_COOKIE = "dpm_admin";
export const CUSTOMER_COOKIE = "dpm_session";
export const LOCALE_COOKIE = "dpm_lang";
