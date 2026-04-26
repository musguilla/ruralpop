import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

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
async function fetchCategoriesFromDB(): Promise<CategoryData[]> {
    const [catRes, subcatRes] = await Promise.all([
        supabaseAdmin.from("categories").select("id, name, order_index").order("order_index", { ascending: true }),
        supabaseAdmin.from("subcategories").select("category_id, name, order_index").order("order_index", { ascending: true })
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
 * Cacheamos la respuesta por 1 hora (3600 segundos) o hasta revalidación manual,
 * para evitar consultar Supabase en cada carga de página en el root layout.
 */
export const getCategories = unstable_cache(
    async () => fetchCategoriesFromDB(),
    ['global-categories'],
    { revalidate: 3600, tags: ['categories'] }
);
