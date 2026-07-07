const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function reproduceMobileApp() {
    let generatedUrl = '';
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: {
            fetch: (url, options) => {
                if (typeof url === 'string') {
                    const fixedUrl = url
                        .replace(/%252C/g, '%2C')
                        .replace(/%2525/g, '%25')
                        .replace(/%257B/g, '%7B')
                        .replace(/%257D/g, '%7D');
                    generatedUrl = fixedUrl;
                    return fetch(fixedUrl, options);
                }
                return fetch(url, options);
            }
        }
    });
    
    // Exact sequence from ruralpop-mobile/app/(tabs)/search.tsx
    let supabaseQuery = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          price_type,
          location,
          image_urls,
          created_at,
          category,
          description,
          user_id,
          status,
          is_featured
        `)
        .eq('status', 'active')
        .or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');

    const activeQuery = 'cincha';
    supabaseQuery = supabaseQuery.or(`title.ilike.%${activeQuery}%,description.ilike.%${activeQuery}%,location.ilike.%${activeQuery}%`);
    
    supabaseQuery = supabaseQuery.order('is_featured', { ascending: false, nullsFirst: false });
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
    supabaseQuery = supabaseQuery.range(0, 29);

    const { data, error } = await supabaseQuery;
    
    console.log('Generated URL:', generatedUrl);
    console.log('Error:', error);
    console.log('Results:', data ? data.map(d => d.title) : []);
}

reproduceMobileApp();
