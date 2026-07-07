const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testWebAppLogic() {
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
    
    let q = supabase.from('listings').select('title').eq('status', 'active');
    
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    
    const queryTerms = ['cabezada', 'cwd'];
    const sanitizedQuery = 'cabezada cwd';
    
    const andConditions = queryTerms.map(term => `or(title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%)`).join(',');
    const finalOr = `and(${andConditions}),tags.cs.{"${sanitizedQuery}"}`;
    
    q = q.or(finalOr);
    
    const { data, error } = await q;
    console.log('URL:', generatedUrl);
    console.log('Error:', error);
    console.log('Data:', data);
}

testWebAppLogic();
