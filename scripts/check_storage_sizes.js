require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);
    
    const { data: files, error } = await supabaseAdmin.storage.from('listings').list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' }});
    
    if (error) {
        console.log("Error:", error);
    } else {
        let totalBytes = 0;
        files.forEach(f => totalBytes += (f.metadata?.size || 0));
        console.log("Total bytes of latest 1000 files in 'listings' bucket:", totalBytes / (1024*1024), "MB");
        
        // Find largest file
        files.sort((a,b) => (b.metadata?.size || 0) - (a.metadata?.size || 0));
        console.log("Largest files:");
        files.slice(0, 5).forEach(f => console.log(f.name, (f.metadata?.size || 0) / (1024*1024), "MB"));
    }
}

main();
