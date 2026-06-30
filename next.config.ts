import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
        permanent: false
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "zupkwctshyqurixsajmr.supabase.co"
      }
    ]
  }
};

export default nextConfig;
