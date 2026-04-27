import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Mengizinkan semua path dari domain ini
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'ur22gyfvyqbzzzqh.public.blob.vercel-storage.com', // Pastikan hostname ini tepat
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-3d3a4cb761e54f86b2a37dcf43daa05e.r2.dev',
        port: '',
        pathname: '/**', // Mengizinkan semua folder di dalam bucket ini
      },
      {
        protocol: 'https',
        hostname: 'cdn.alivemansion.com',
        port: '',
        pathname: '/**', // Mengizinkan semua folder di dalam bucket ini
      },
    ],
  },
};

export default nextConfig;
