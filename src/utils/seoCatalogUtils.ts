import { createClient } from "@/utils/supabase/server";

interface CatalogSeoData {
    count: number;
    tags: string[];
}

import { LOCATIONS } from "@/constants/locations";

export async function getCatalogSeoData(parsedSlug: any): Promise<CatalogSeoData> {
    const supabase = await createClient();
    let query = supabase.from("listings").select("title", { count: "exact", head: false }).eq("status", "active").eq("users.is_ghost", false);
    
    // Quick pseudo-join for ghost check is needed if we use it, but since we are doing a fast count:
    query = supabase.from("listings").select("id, title", { count: "exact" }).eq("status", "active");

    if (parsedSlug.category) query = query.eq("category", parsedSlug.category);
    if (parsedSlug.subcategory) query = query.ilike("subcategory", parsedSlug.subcategory);
    
    if (parsedSlug.province_id) {
        const locFilter = String(parsedSlug.province_id);
        if (locFilter.startsWith('m')) {
            const muni = LOCATIONS.find((l: { id: string }) => l.id === locFilter);
            if (muni) {
                query = query.ilike("location", `%${muni.name}%`);
            } else {
                const muniId = locFilter.substring(1);
                query = query.eq("municipality_id", muniId);
            }
        } else {
            query = query.eq("province_id", parsedSlug.province_id);
        }
    }
    if (parsedSlug.q) {
        let sanitizedQuery = parsedSlug.q.trim().toLowerCase();
        let queryTerms = sanitizedQuery.split(/[\s\-]+/).filter((t: string) => t.length > 2);
        queryTerms.forEach((term: string) => {
            query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`);
        });
    }

    query = query.limit(10); // We only need up to 10 to extract some tags, and exact count handles the total

    const { data, count, error } = await query;

    if (error || !data) return { count: 0, tags: [] };

    // Extract tags from titles
    const allWords = data.flatMap((d: any) => d.title.toLowerCase().split(/[\s,-]+/));
    const stopWords = new Set(["de", "para", "en", "el", "la", "y", "con", "sin", "a", "los", "las", "un", "una"]);
    const wordCounts = allWords.reduce((acc: Record<string, number>, word: string) => {
        if (word.length > 3 && !stopWords.has(word)) acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const tags = Object.entries(wordCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(e => e[0]);

    return { count: count || 0, tags };
}
