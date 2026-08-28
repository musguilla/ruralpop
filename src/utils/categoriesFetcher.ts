import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { getTenantConfig, RURALPOP_TENANT_SLUG } from "@/config/tenants";

export interface CategoryData {
    id: string;
    label: string;
    subcategories: string[];
}

// Creamos un admin client localmente para esta utilidad, 
// así nos saltamos cualquier RLS y garantizamos que el servidor lee todas las categorías.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Función interna que hace la llamada real a base de datos.
 */
async function fetchCategoriesFromDB(tenantSlug: string, locale: string = 'es'): Promise<CategoryData[]> {
    const config = getTenantConfig(tenantSlug);
    const uuid = config.id || tenantSlug;
    
    let filterString = `tenant_id.eq.${uuid}`;
    if (config.slug === RURALPOP_TENANT_SLUG || tenantSlug === RURALPOP_TENANT_SLUG) {
        filterString = `tenant_id.eq.${uuid},tenant_id.is.null`;
    }
    
    const [catRes, subcatRes] = await Promise.all([
        supabaseAdmin.from("categories").select("id, name, name_pt, order_index").or(filterString).order("order_index", { ascending: true }),
        supabaseAdmin.from("subcategories").select("category_id, name, name_pt, order_index").or(filterString).order("order_index", { ascending: true })
    ]);

const ptSubcategoryFallback: Record<string, string> = {
    "Bovino": "Bovinos",
    "Equino": "Equinos",
    "Caprino": "Caprinos",
    "Ovino": "Ovinos",
    "Porcino": "Suínos",
    "Avicultura": "Avicultura",
    "Apicultura": "Apicultura",
    "Perros": "Cães",
    "Conejos": "Coelhos",
    "Tractores": "Tratores",
    "Abonadoras": "Distribuidores de adubo",
    "Cosechadoras": "Ceifeiras",
    "Depósitos": "Depósitos",
    "Desbrozadoras": "Roçadoras",
    "Empacadoras": "Enfaradadeiras",
    "Encintadoras": "Plastificadoras",
    "Motocultores": "Motocultivadores",
    "Remolques": "Reboques",
    "Segadoras": "Gadanheiras",
    "Sembradoras": "Semeadores",
    "Silos": "Silos",
    "Sulfatadoras": "Pulverizadores",
    "Trituradoras": "Trituradores",
    "Volteadoras": "Viradores",
    "Otra maquinaria agrícola": "Outras máquinas agrícolas",
    "Alimentación y agua": "Alimentação e água",
    "Cerramientos": "Vedações",
    "Equitación y material equino": "Equitação e material equino",
    "Identificación y trazabilidad": "Identificação e rastreabilidade",
    "Limpieza, purines y estiércol": "Limpeza, chorume e estrume",
    "Material apicultura": "Material de apicultura",
    "Material avicultura": "Material de avicultura",
    "Material conejos": "Material para coelhos",
    "Material ovino": "Material para ovinos",
    "Material porcino": "Material para suínos",
    "Material vacuno": "Material para bovinos",
    "Ordeño y leche": "Ordenha e leite",
    "Venta": "Venda",
    "Alquiler": "Arrendamento",
    "Traspasos explotaciones": "Trespasse de explorações",
    "Semillas": "Sementes",
    "Plantas y plantones": "Plantas e mudas",
    "Cerramientos y vallados": "Vedações",
    "Construcción rural": "Construção rural",
    "Esquiladores": "Tosquiadores",
    "Herradores": "Ferradores",
    "Mantenimiento de fincas": "Manutenção de quintas",
    "Servicios forestales": "Serviços florestais",
    "Transporte": "Transporte",
    "Veterinarios": "Veterinários",
};

const ptCategoryFallback: Record<string, string> = {
    "Ganadería": "Pecuária",
    "Maquinaria y herramientas": "Máquinas e ferramentas",
    "Recambios maquinaria": "Peças de máquinas",
    "Equipamiento y material": "Equipamento e material",
    "Forraje y alimentación animal": "Forragem e alimentação animal",
    "Fincas": "Quintas",
    "Agricultura": "Agricultura",
    "Servicios": "Serviços",
    "Alimentos Km0": "Alimentos Km0",
    "Camiones y furgonetas": "Camiões e carrinhas",
    "Coches": "Carros",
    "ATV": "Moto4",
    "Motos": "Motos",
    "Genética y reproducción": "Genética e reprodução"
};

    if (!catRes.data) return [];

    const categories: CategoryData[] = catRes.data.map((cat) => {
        const relatedSubcats = subcatRes.data?.filter(sub => sub.category_id === cat.id) || [];
        
        let currentCatName = cat.name;
        if (locale === 'pt') {
            currentCatName = cat.name_pt || ptCategoryFallback[cat.name] || cat.name;
        }

        return {
            id: cat.id,
            label: currentCatName,
            subcategories: relatedSubcats.map(sub => {
                if (locale === 'pt') {
                    return sub.name_pt || ptSubcategoryFallback[sub.name] || sub.name;
                }
                return sub.name;
            })
        };
    });

    return categories;
}

/**
 * Función cacheada para Next.js App Router.
 * Cacheamos la respuesta por 1 hora o hasta revalidación manual,
 * aislada por tenant para evitar fugas de datos entre plataformas.
 */
export const getCategories = async (tenantSlug: string, locale: string = 'es') => {
    const cachedFn = unstable_cache(
        async () => fetchCategoriesFromDB(tenantSlug, locale),
        [`global-categories-v10-${tenantSlug}-${locale}`],
        { revalidate: 3600, tags: ['categories-v10', `categories-v10-${tenantSlug}`, `categories-v10-${tenantSlug}-${locale}`] }
    );
    return cachedFn();
};

export const getActiveEquipopSubcategories = async () => {
    const cachedFn = unstable_cache(
        async () => {
            const { data } = await supabaseAdmin
                .from('listings')
                .select('equipop_category, equipop_subcategory')
                .eq('status', 'active')
                .not('equipop_category', 'is', null);

            const activeCats = [...new Set((data || []).map(d => d.equipop_category))].filter(Boolean) as string[];
            const activeSubcats = [...new Set((data || []).map(d => d.equipop_subcategory))].filter(Boolean) as string[];
            
            return {
                categories: activeCats,
                subcategories: activeSubcats
            };
        },
        [`equipop-active-subcategories`],
        { revalidate: 3600, tags: ['equipop-active-subcategories'] }
    );
    return cachedFn();
};
