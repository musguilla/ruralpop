import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
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
      },
      {
        protocol: 'https',
        hostname: 'media.ruralpop.com',
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
      { source: '/tractores/use/:slug*', destination: '/tractores/uso/:slug*', permanent: true },
      { source: '/tractores/crop/:slug*', destination: '/tractores/cultivo/:slug*', permanent: true },
      { source: '/tractores/weight/:slug*', destination: '/tractores/peso/:slug*', permanent: true },
      { source: '/tractores/power-range/:slug*', destination: '/tractores/potencia/:slug*', permanent: true },
      { source: '/tractores/speed/:slug*', destination: '/tractores/velocidad/:slug*', permanent: true },
      { source: '/tractores/fuel-tank/:slug*', destination: '/tractores/deposito/:slug*', permanent: true },
      { source: '/tractores/engine/:slug*', destination: '/tractores/motor/:slug*', permanent: true },
      { source: '/tractores/traction/:slug*', destination: '/tractores/traccion/:slug*', permanent: true },
    ];
  },
};

export default nextConfig;
