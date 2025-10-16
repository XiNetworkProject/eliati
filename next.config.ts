import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Pour les images locales PNG
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
