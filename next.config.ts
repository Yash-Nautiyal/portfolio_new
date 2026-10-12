import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "play.google.com" },
    ],
    // Optimised phone screens rarely change: keep them in browser/CDN caches for 31 days.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    // /public/assets filenames aren't content-hashed, so cache for 30 days (not immutable) and revalidate in the background.
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
