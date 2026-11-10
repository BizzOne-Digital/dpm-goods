import type { NextConfig } from "next";

/**
 * Cache Components is intentionally disabled: the storefront and admin are
 * database-driven and rendered per request so admin edits show up instantly.
 */
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["mongoose", "sanitize-html"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // MongoDB-stored uploads are served by /api/uploads/[folder]/[filename]
    localPatterns: [
      { pathname: "/api/uploads/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/brand/**", search: "" },
      { pathname: "/dpm_goods_images/**", search: "" },
      { pathname: "/dpm_goods_remaining_images/**", search: "" },
    ],
  },
};

export default nextConfig;
