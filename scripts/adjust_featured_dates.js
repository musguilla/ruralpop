require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const updates = [
        { titleLike: '%Potro HB%', createdAt: '2026-08-15T21:16:00Z' },
        { titleLike: '%BORDER COLLIE%', createdAt: '2026-08-13T22:17:00Z' },
        { titleLike: '%Suffolk%', createdAt: '2026-08-11T18:53:00Z' },
        { titleLike: '%Jaulas jilgueros%', createdAt: '2026-08-10T05:07:00Z' },
        { titleLike: '%Potra de año%', createdAt: '2026-08-08T20:17:00Z' },
        { titleLike: '%Carnero Pelibuey puro%', createdAt: '2026-08-07T18:19:00Z' },
        { titleLike: '%Silo de pienso%', createdAt: '2026-08-04T22:38:00Z' },
        { titleLike: '%Carro mezclador SEKO%', createdAt: '2026-08-04T22:33:00Z' },
        { titleLike: '%Sulfatadora Sanz%', createdAt: '2026-08-04T22:27:00Z' },
        { titleLike: '%Segadora Kuhn%', createdAt: '2026-08-04T22:22:00Z' },
    ];

    for (const update of updates) {
        const { data, error } = await supabase
            .from('listings')
            .update({ created_at: update.createdAt })
            .ilike('title', update.titleLike)
            .eq('is_featured', true)
            .select('id, title');
            
        if (error) {
            console.error(`Error updating ${update.titleLike}:`, error.message);
        } else {
            console.log(`Updated ${data.length} listing(s) for ${update.titleLike}`);
        }
    }
}
main();
