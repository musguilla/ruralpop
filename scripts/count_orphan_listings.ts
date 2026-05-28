import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    async function fetchAllRecords(table: string, selectQuery: string) {
        let allData: any[] = [];
        let from = 0;
        const step = 1000;
        
        while (true) {
            const { data, error } = await supabase
                .from(table)
                .select(selectQuery)
                .range(from, from + step - 1);
                
            if (error || !data || data.length === 0) break;
            allData = allData.concat(data);
            if (data.length < step) break;
            from += step;
        }
        return allData;
    }

    console.log("Contando anuncios huérfanos...");
    
    // Obtenemos todos los listings
    const listings = await fetchAllRecords('listings', 'id, user_id, title');

    // Obtenemos todos los perfiles de usuario
    const profiles = await fetchAllRecords('users', 'id');

    const validUserIds = new Set(profiles.map(p => p.id));
    
    const orphanListings = listings.filter(l => !validUserIds.has(l.user_id));
    
    console.log(`Total de anuncios en la BD: ${listings.length}`);
    console.log(`Total de usuarios válidos: ${validUserIds.size}`);
    console.log(`Total de anuncios huérfanos: ${orphanListings.length}`);

    // Mostrar algunos ejemplos si hay
    if (orphanListings.length > 0) {
        console.log("\nEjemplos de anuncios huérfanos:");
        orphanListings.slice(0, 5).forEach(l => {
            console.log(`- ID: ${l.id} | Título: ${l.title} | User ID: ${l.user_id}`);
        });
    }
}
run();
