const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDoubleOr() {
    let generatedUrl = '';
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: {
            fetch: (url, options) => {
                generatedUrl = url;
                return fetch(url, options);
            }
        }
    });
    
    let q = supabase.from('listings').select('title').eq('status', 'active');
    
    // First OR (tenant)
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    
    // Second OR (search)
    q = q.or('title.ilike.%Cabezada%');
    
    await q;
    console.log('Generated URL:', generatedUrl);
}

testDoubleOr();
