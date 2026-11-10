import Image, { type ImageProps } from "next/image";
import { normalizeImageUrl } from "@/lib/image-url";

type SmartImageProps = Omit<ImageProps, "src"> & { src?: string | null };

/**
 * next/image wrapper for admin-managed images.
 * - Normalizes legacy `/uploads/` URLs to a placeholder.
 * - MongoDB uploads (`/api/uploads/**`) and Unsplash are both allowed in next.config.ts.
 */
export default function SmartImage({ src, alt, ...props }: SmartImageProps) {
  const url = normalizeImageUrl(src);
  return <Image src={url} alt={alt} {...props} />;
}
