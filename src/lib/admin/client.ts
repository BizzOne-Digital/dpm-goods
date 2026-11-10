"use client";

import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, type UploadFolder } from "@/lib/constants";

export type ApiResult<T = Record<string, unknown>> = ({ success: true } & T) | { success: false; message: string; errors?: Record<string, string> };

/** JSON fetch for admin APIs. Redirects to the login page when the session expires. */
export async function adminFetch<T = Record<string, unknown>>(url: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...(init.headers ?? {}) },
    });
    if (res.status === 401 && typeof window !== "undefined") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears stale admin state
      window.location.assign("/admin/login");
    }
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { success: false, message: "Network error. Please check your connection." };
  }
}

/** Uploads a file to MongoDB storage via /api/upload and returns the public URL. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<{ url: string } | { error: string }> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return { error: "Use a JPG, PNG, WebP or GIF image." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Image is larger than 8 MB." };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await adminFetch<{ url: string }>("/api/upload", { method: "POST", body: formData });
  return res.success ? { url: res.url } : { error: res.message };
}
