import { CATEGORIES } from '@/constants/categories';
import { buildSeoUrl } from '@/utils/seoUtils';
import { PREDEFINED_TAGS } from '@/constants/predefinedTags';

export const dynamic = "force-dynamic";

export async function getEquipopSitemapXmlById(id: number): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_EQUIPOP_URL || 'https://www.equipop.app';

    const sitemapEntries: any[] = [];

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

    // 2. Main Pages
    const mainPages = [
        '/como-vender',
        '/como-comprar',
        '/pago-seguro',
        '/preguntas-frecuentes',
        '/contact',
        '/aviso-legal',
        '/privacy',
        '/cookies',
        '/quienes-somos',
        '/profesionales',
        '/tienda',
    ];

    mainPages.forEach(page => {
        addEntry(page, 0.9);
    });

    // 3. Equipop Categories
    const equipopCategoriesIndex = CATEGORIES.findIndex(c => c.id === "sillas-de-montar-y-accesorios");
    const equipopCategories = equipopCategoriesIndex !== -1 ? CATEGORIES.slice(equipopCategoriesIndex) : [];

    equipopCategories.forEach(cat => {
        // Categoría sola
        addEntry(buildSeoUrl({ category: cat.id }), 0.9);

        // Subcategorías solas
        cat.subcategories.forEach(sub => {
            addEntry(buildSeoUrl({ category: cat.id, subcategory: sub }), 0.8);
        });
    });

    const xmlUrls = sitemapEntries.map(entry => `
        <url>
            <loc>${entry.url}</loc>
            <lastmod>${entry.lastModified.toISOString()}</lastmod>
            <changefreq>${entry.changeFrequency}</changefreq>
            <priority>${entry.priority.toFixed(2)}</priority>
        </url>
    `).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlUrls}
</urlset>`.trim();
}

export async function getEquipopTagsSitemapXml(): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_EQUIPOP_URL || 'https://www.equipop.app';

    const uniqueUrls = new Set<string>();

    const normalizeUrlString = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quita acentos
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // espacios y raros por guiones
            .replace(/^-+|-+$/g, ''); // quita guiones en extremos
    };

    // Las keys de Equipop en PREDEFINED_TAGS:
    const equipopKeys = [
        "sillas de montar y accesorios", "mantillas y salvacruces", "cabezadas y riendas",
        "bocados y filetes", "protectores y vendas", "mantas", "cuidado e higiene del caballo",
        "alimentacion y suplementos", "herrado y cascos", "trabajo pie a tierra y entrenamiento",
        "transporte y viaje", "seguridad y visibilidad", "equipamiento medico y recuperacion",
        "establo y cuadra", "reproduccion y cria", "otros productos para caballos",
        "calzado ecuestre", "cascos y seguridad", "ropa ecuestre mujer", "ropa ecuestre hombre",
        "ropa ecuestre infantil", "guantes ecuestres", "ropa reflectante y seguridad vial",
        "fustas, espuelas y ayudas", "accesorios para riders", "equipamiento de competicion",
        "outdoor y lifestyle ecuestre", "bolsas y almacenamiento", "otros productos para riders"
    ];

    for (const key of equipopKeys) {
        if (PREDEFINED_TAGS[key]) {
            for (const tag of PREDEFINED_TAGS[key]) {
                const tagSlug = normalizeUrlString(tag);
                uniqueUrls.add(`${baseUrl}/${tagSlug}`);
            }
        }
    }

    if (uniqueUrls.size === 0) {
        uniqueUrls.add(`${baseUrl}/`);
    }

    const xmlUrls = Array.from(uniqueUrls).map(url => `
        <url>
            <loc>${url}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.70</priority>
        </url>
    `).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlUrls}
</urlset>`.trim();
}
