import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';

    if (host.includes('ruralpop.pt')) {
        return {
            rules: {
                userAgent: '*',
                disallow: ['/cgi-bin/', '/admin/'],
            },
            sitemap: [
                'https://www.ruralpop.pt/sitemap_index.xml',
                'https://www.ruralpop.pt/sitemap_pt_index.xml',
            ],
        };
    }

    if (host.includes('equipop')) {
        return {
            rules: {
                userAgent: '*',
                disallow: ['/cgi-bin/', '/admin/'],
            },
            sitemap: [
                'https://www.equipop.app/sitemap_index.xml',
            ],
        };
    }

    return {
        rules: {
            userAgent: '*',
            disallow: ['/cgi-bin/', '/admin/'],
        },
        sitemap: [
            'https://www.ruralpop.com/sitemap_index.xml',
            'https://www.ruralpop.com/sitemap_tags.xml',
            'https://www.ruralpop.com/sitemap_lonjas.xml',
            'https://www.ruralpop.com/sitemap_tractors.xml',
            'https://www.ruralpop.com/sitemap_pt_index.xml',
        ],
    };
}
