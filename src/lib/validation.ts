import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);

export const newsletterSchema = z.object({ email });

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Name is required"),
  email,
  phone: trimmed(40).optional().default(""),
  subject: trimmed(150).optional().default(""),
  message: trimmed(3000).min(10, "Please write at least 10 characters"),
});

export const bookingSchema = z.object({
  name: trimmed(100).min(2, "Name is required"),
  email,
  phone: trimmed(40).optional().default(""),
  bookingType: trimmed(120).min(2, "Choose a service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a valid time"),
  message: trimmed(2000).optional().default(""),
});

export const registerSchema = z.object({
  name: trimmed(100).min(2, "Name is required"),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(200),
});

export const profileSchema = z.object({
  name: trimmed(100).min(2),
  email,
  phone: trimmed(40).optional().default(""),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const addressSchema = z.object({
  label: trimmed(40).optional().default("Home"),
  firstName: trimmed(80).min(1),
  lastName: trimmed(80).min(1),
  address: trimmed(200).min(3),
  apartment: trimmed(100).optional().default(""),
  city: trimmed(100).min(1),
  state: trimmed(100).min(1),
  zip: trimmed(20).min(2),
  country: trimmed(80).min(2),
  phone: trimmed(40).optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

export const addressesSchema = z.object({ addresses: z.array(addressSchema).max(10) });

export const cartItemSchema = z.object({
  key: trimmed(300),
  productId: trimmed(60),
  slug: trimmed(200),
  name: trimmed(200),
  image: trimmed(500).optional(),
  price: z.number().min(0).max(100000),
  size: trimmed(40).optional(),
  color: trimmed(60).optional(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: trimmed(60),
        size: trimmed(40).optional(),
        color: trimmed(60).optional(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Your cart is empty")
    .max(50),
  contact: z.object({ email, phone: trimmed(40).optional().default("") }),
  shipping: z.object({
    firstName: trimmed(80).min(1, "Required"),
    lastName: trimmed(80).min(1, "Required"),
    address: trimmed(200).min(3, "Required"),
    apartment: trimmed(100).optional().default(""),
    city: trimmed(100).min(1, "Required"),
    state: trimmed(100).min(1, "Required"),
    zip: trimmed(20).min(2, "Required"),
    country: trimmed(80).min(2, "Required"),
  }),
  promoCode: trimmed(40).optional(),
});

export const promoCheckSchema = z.object({ code: trimmed(40).min(1), subtotal: z.number().min(0) });
