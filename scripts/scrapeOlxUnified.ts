/**
 * Unified OLX Portugal Scraper & Importer for Ruralpop
 * 
 * Technical Rationale:
 * - Uses scripts/olx_fetcher.py to bypass CloudFront AWS WAF TLS fingerprinting.
 * - Saves multiple high-resolution photos hosted directly on OLX CDN (0 B Supabase Storage).
 * - Maps Portuguese distritos into standard Ruralpop PT range (101-118).
 * - Creates/reuses ghost seller accounts for seamless buyer contact.
 * - Prevents duplicate ads via title_pt checks.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execFile } from 'child_process';
import path from 'path';
import { promisify } from 'util';

dotenv.config({ path: '.env.local' });

const execFileAsync = promisify(execFile);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Missing Supabase environment variables in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanString(str: string | null | undefined): string {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const PT_REGIONS: Record<string, number> = {
    'aveiro': 101,
    'beja': 102,
    'braga': 103,
    'braganca': 104,
    'bragança': 104,
    'castelo branco': 105,
    'coimbra': 106,
    'evora': 107,
    'évora': 107,
    'faro': 108,
    'guarda': 109,
    'leiria': 110,
    'lisboa': 111,
    'portalegre': 112,
    'porto': 113,
    'santarem': 114,
    'santarém': 114,
    'setubal': 115,
    'setúbal': 115,
    'viana do castelo': 116,
    'vila real': 117,
    'viseu': 118
};

function getProvinceId(regionName?: string): number {
    if (!regionName) return 101;
    const key = regionName.toLowerCase().trim();
    return PT_REGIONS[key] || 101;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CategoryConfig {
    key: string;
    label: string;
    baseUrl: string;
    category: string;
    subcategory: string;
}

export const CATEGORIES: CategoryConfig[] = [
    {
        key: 'vacas',
        label: 'Vacas / Bovino',
        baseUrl: 'https://www.olx.pt/animais/animais-de-quinta/vacas/',
        category: 'ganaderia',
        subcategory: 'bovino'
    },
    {
        key: 'cavalos',
        label: 'Cavalos / Equino',
        baseUrl: 'https://www.olx.pt/animais/cavalos/',
        category: 'ganaderia',
        subcategory: 'equino'
    },
    {
        key: 'ovelhas',
        label: 'Ovelhas / Ovino',
        baseUrl: 'https://www.olx.pt/animais/animais-de-quinta/ovelhas/',
        category: 'ganaderia',
        subcategory: 'ovino'
    },
    {
        key: 'cabras',
        label: 'Cabras / Caprino',
        baseUrl: 'https://www.olx.pt/animais/animais-de-quinta/cabras/',
        category: 'ganaderia',
        subcategory: 'caprino'
    },
    {
        key: 'porcos',
        label: 'Porcos / Suíno',
        baseUrl: 'https://www.olx.pt/animais/animais-de-quinta/porcos/',
        category: 'ganaderia',
        subcategory: 'porcino'
    },
    {
        key: 'tratores',
        label: 'Tratores / Maquinaria',
        baseUrl: 'https://www.olx.pt/ads/q-tratores/',
        category: 'maquinaria',
        subcategory: 'Tractores'
    }
];

async function fetchOlxPage(url: string) {
    const pythonScript = path.resolve(process.cwd(), 'scripts/olx_fetcher.py');
    try {
        const { stdout } = await execFileAsync('python3', [pythonScript, url], {
            maxBuffer: 10 * 1024 * 1024
        });
        const parsed = JSON.parse(stdout);
        return parsed.ads || [];
    } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`  ⚠️ Error calling fetcher bridge for ${url}:`, errorMsg);
        return [];
    }
}

async function scrapeCategory(cat: CategoryConfig, maxPages: number = 3): Promise<number> {
    console.log(`\n==================================================`);
    console.log(`🚀 Iniciando importação: ${cat.label}`);
    console.log(`   Categoria: ${cat.category} | Subcategoria: ${cat.subcategory}`);
    console.log(`==================================================`);

    let categoryCount = 0;

    for (let page = 1; page <= maxPages; page++) {
        const pageUrl = cat.baseUrl.includes('?') 
            ? `${cat.baseUrl}&page=${page}` 
            : `${cat.baseUrl}?page=${page}`;

        console.log(`\n📄 [Página ${page}/${maxPages}] Buscando OLX: ${pageUrl}`);
        const ads = await fetchOlxPage(pageUrl);

        if (!ads || ads.length === 0) {
            console.log(`   Não foram encontrados mais anúncios nesta página. Finalizando categoria.`);
            break;
        }

        console.log(`   Encontrados ${ads.length} anúncios na página ${page}. Processando inserção...`);

        for (const adData of ads) {
            const rawTitle = adData.title || "";
            if (!rawTitle.trim()) continue;

            // Check duplicate by title_pt
            const { data: existingListing } = await supabase
                .from('listings')
                .select('id')
                .eq('title_pt', rawTitle)
                .maybeSingle();

            if (existingListing) {
                console.log(`   ⏭️ Ignorado (já existe): "${rawTitle.slice(0, 40)}..."`);
                continue;
            }

            let description = (adData.description || "").replace(/<[^>]*>?/gm, '').trim();
            const locality = adData.location?.cityName || adData.location?.regionName || "Portugal";
            const photos: string[] = Array.isArray(adData.photos)
                ? adData.photos.filter((p: unknown): p is string => typeof p === 'string' && p.startsWith('http')).slice(0, 5)
                : [];
            const sellerName = adData.user?.name || "Vendedor OLX";
            const numericId = adData.id || Date.now();

            // Extract potential phone from description
            let phone: string | null = null;
            const phoneMatch = description.match(/(?:(?:\+|00)351\s*)?(?:9[1236]\d{7}|2\d{8})/);
            if (phoneMatch) {
                phone = phoneMatch[0].replace(/\s+/g, '');
            }

            const safeName = cleanString(sellerName) || "user";
            const userEmail = `${safeName}_${numericId}@ruralpop.com`;

            let sellerId: string | null = null;
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .maybeSingle();

            const provinceId = getProvinceId(adData.location?.regionName);

            if (existingUser) {
                sellerId = existingUser.id;
            } else {
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email: userEmail,
                    password: 'password123',
                    email_confirm: true,
                    user_metadata: { name: sellerName, is_ghost: true }
                });

                if (authError) {
                    const { data: allUsers } = await supabase.auth.admin.listUsers();
                    const found = allUsers.users.find(u => u.email === userEmail);
                    if (found) sellerId = found.id;
                } else if (authUser?.user) {
                    sellerId = authUser.user.id;
                    await supabase.from('users').upsert({
                        id: sellerId,
                        email: userEmail,
                        name: sellerName,
                        phone: phone || null,
                        location: locality,
                        province_id: provinceId,
                        company_country: 'PT',
                        is_ghost: false,
                        created_at: new Date().toISOString()
                    });
                }
            }

            if (!sellerId) {
                console.warn(`   ⚠️ Não foi possível obter ID de vendedor para: ${userEmail}`);
                continue;
            }

            const rawPrice = adData.price?.regularPrice?.value;
            const price = typeof rawPrice === 'number' ? rawPrice : 0;

            const adPayload = {
                title: rawTitle,
                title_pt: rawTitle,
                description: description,
                description_pt: description,
                price: price,
                price_type: price > 0 ? "fixed" : "negotiable",
                location: locality,
                image_urls: photos,
                user_id: sellerId,
                status: "active",
                category: cat.category,
                subcategory: cat.subcategory,
                province_id: getProvinceId(adData.location?.regionName),
                municipality_id: 100000,
                contact_phone: phone || "000000000",
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase.from('listings').insert(adPayload);

            if (insertError) {
                console.error(`   ❌ Erro ao inserir "${rawTitle}":`, insertError.message);
            } else {
                console.log(`   ✅ Inserido [${cat.subcategory}]: "${rawTitle.slice(0, 45)}..." (${price}€ - ${locality})`);
                categoryCount++;
            }

            await sleep(300);
        }

        await sleep(1000);
    }

    return categoryCount;
}

async function main() {
    const args = process.argv.slice(2);
    const categoryArg = args.find(a => a.startsWith('--category='))?.split('=')[1]?.toLowerCase();
    const pagesArg = args.find(a => a.startsWith('--pages='))?.split('=')[1];
    const isAll = args.includes('--all') || !categoryArg;
    const maxPages = pagesArg ? parseInt(pagesArg, 10) : 3;

    console.log(`=======================================================`);
    console.log(`🇵🇹 RURALPOP - Importador de Anúncios em Português`);
    console.log(`   Páginas por categoria: ${maxPages}`);
    console.log(`=======================================================`);

    let targetCategories: CategoryConfig[] = [];

    if (categoryArg) {
        const found = CATEGORIES.find(c => c.key === categoryArg || c.subcategory.toLowerCase() === categoryArg);
        if (!found) {
            console.error(`❌ Categoria desconhecida: "${categoryArg}".`);
            console.log(`Categorias válidas: ${CATEGORIES.map(c => c.key).join(', ')}`);
            process.exit(1);
        }
        targetCategories = [found];
    } else if (isAll) {
        targetCategories = CATEGORIES;
    }

    let grandTotal = 0;
    for (const cat of targetCategories) {
        const count = await scrapeCategory(cat, maxPages);
        grandTotal += count;
        console.log(`\n✨ Concluído ${cat.label}: +${count} novos anúncios inseridos.`);
        await sleep(1500);
    }

    console.log(`\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!`);
    console.log(`Total geral de novos anúncios importados: ${grandTotal}`);
    console.log(`Supabase Storage impacto: 0 B (todas as fotos hospedadas na CDN externa do OLX).`);
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
