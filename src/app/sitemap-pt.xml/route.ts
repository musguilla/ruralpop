import { NextResponse } from 'next/server';
import { ptIndexableRoutes } from '@/i18n/config';
import { getHreflangLinks } from '@/i18n/utils';

export async function GET() {
  const domain = 'https://www.ruralpop.com';
  const currentDate = new Date().toISOString();

  // Create URL entries for the sitemap
  const urls = ptIndexableRoutes.map((route) => {
    // Generate hreflangs
    const hreflangs = getHreflangLinks(route, domain);
    
    // Generate <xhtml:link> tags
    const hreflangTags = Object.entries(hreflangs)
      .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`)
      .join('\n');

    return `  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '/pt' ? '1.0' : '0.8'}</priority>
${hreflangTags}
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
