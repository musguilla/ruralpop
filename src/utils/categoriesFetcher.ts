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
async function fetchCategoriesFromDB(tenantSlug: string): Promise<CategoryData[]> {
    const config = getTenantConfig(tenantSlug);
    const uuid = config.id || tenantSlug;
    
    let filterString = `tenant_id.eq.${uuid}`;
    if (config.slug === RURALPOP_TENANT_SLUG || tenantSlug === RURALPOP_TENANT_SLUG) {
        filterString = `tenant_id.eq.${uuid},tenant_id.is.null`;
    }
    
    const [catRes, subcatRes] = await Promise.all([
        supabaseAdmin.from("categories").select("id, name, order_index").or(filterString).order("order_index", { ascending: true }),
        supabaseAdmin.from("subcategories").select("category_id, name, order_index").or(filterString).order("order_index", { ascending: true })
    ]);

    if (!catRes.data) return [];

    const categories: CategoryData[] = catRes.data.map((cat) => {
        const relatedSubcats = subcatRes.data?.filter(sub => sub.category_id === cat.id) || [];
        return {
            id: cat.id,
            label: cat.name,
            subcategories: relatedSubcats.map(sub => sub.name)
        };
    });

    return categories;
}

/**
 * Función cacheada para Next.js App Router.
 * Cacheamos la respuesta por 1 hora o hasta revalidación manual,
 * aislada por tenant para evitar fugas de datos entre plataformas.
 */
export const getCategories = async (tenantSlug: string) => {
    const cachedFn = unstable_cache(
        async () => fetchCategoriesFromDB(tenantSlug),
        [`global-categories-${tenantSlug}`],
        { revalidate: 3600, tags: ['categories', `categories-${tenantSlug}`] }
    );
    return cachedFn();
};
