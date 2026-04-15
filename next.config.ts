import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zrpucbuvojskcwrhwevv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/:category/anuncio/:slug*',
        destination: '/anuncio/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
