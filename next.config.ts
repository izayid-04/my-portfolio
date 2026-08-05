import type { NextConfig } from "next";

// Reload server cache
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
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

export default nextConfig;
