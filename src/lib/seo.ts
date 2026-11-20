import type { Metadata } from "next";
import { normalizeImageUrl } from "@/lib/image-url";
import { siteUrl } from "@/lib/utils";

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const img = image ? normalizeImageUrl(image) : undefined;
  const absoluteImage = img ? (img.startsWith("http") ? img : siteUrl(img)) : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: siteUrl(path),
      siteName: "Universal UPM Goods",
      type,
      ...(absoluteImage ? { images: [{ url: absoluteImage }] } : {}),
    },
    twitter: {
      card: absoluteImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
