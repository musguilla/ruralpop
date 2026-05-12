import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            disallow: '/cgi-bin/',
        },
        sitemap: [
            'https://www.ruralpop.com/sitemap_index.xml',
            'https://www.ruralpop.com/sitemap_anuncios.xml',
            'https://www.ruralpop.com/sitemap_lonjas.xml',
            'https://www.ruralpop.com/sitemap_tractores.xml'
        ],
    };
}
