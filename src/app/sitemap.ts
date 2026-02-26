import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/constants/categories';
import { LOCATIONS } from '@/constants/locations';
import { buildSeoUrl } from '@/utils/seoUtils';
import { SEO_LANDINGS } from '@/constants/seoLandings';

export const revalidate = 86400; // 24 horas

export default function sitemap(): MetadataRoute.Sitemap {
    // Definimos la base URL, en producción debería ser una variable de entorno
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

    const sitemapEntries: MetadataRoute.Sitemap = [];

    const addEntry = (path: string, priority: number = 0.8) => {
        sitemapEntries.push({
            url: `${baseUrl}${path}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority,
        });
    };

    // 1. Home Base
    addEntry('/', 1.0);

    // 1.5 Landings SEO Long-Tail (Alta prioridad)
    SEO_LANDINGS.forEach(landing => {
        addEntry(`/s/${landing.slug}`, 0.95);
    });

    // 2. Solo Categorías y Subcategorías
    CATEGORIES.forEach(cat => {
        // Categoría sola
        addEntry(buildSeoUrl({ category: cat.id }), 0.9);

        // Subcategorías solas
        cat.subcategories.forEach(sub => {
            addEntry(buildSeoUrl({ category: cat.id, subcategory: sub }), 0.8);
        });
    });

    // 3. Solo Localizaciones
    LOCATIONS.forEach(loc => {
        addEntry(buildSeoUrl({ province_id: loc.id }), 0.8);
    });

    // 4. Combinaciones: Categoría + Localización
    CATEGORIES.forEach(cat => {
        LOCATIONS.forEach(loc => {
            addEntry(buildSeoUrl({ category: cat.id, province_id: loc.id }), 0.7);
        });
    });

    // 5. Combinaciones: Subcategoría + Localización
    CATEGORIES.forEach(cat => {
        cat.subcategories.forEach(sub => {
            LOCATIONS.forEach(loc => {
                addEntry(buildSeoUrl({ category: cat.id, subcategory: sub, province_id: loc.id }), 0.6);
            });
        });
    });

    return sitemapEntries;
}
