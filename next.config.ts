import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Reload server cache
const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lws.info",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "udb.sn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.udb.sn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "biacode.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.biacode.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "easytecs.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.easytecs.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uwezo.yt",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.uwezo.yt",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
