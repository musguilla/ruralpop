import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function test() {
    const sanitizedQuery = "vacas lecheras";
    const queryTerms = sanitizedQuery.split(/[\s\-]+/).filter(t => t.length > 2);
    const andConditions = queryTerms.map(term => `and(or(title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%))`).join(',');
    const orString = `and(${andConditions}),tags.cs.{"${sanitizedQuery}"}`;
    
    console.log("Testing syntax:", orString);
    
    const { data, error } = await supabase.from('listings').select('id').or(orString).limit(1);
    
    if (error) {
        console.log("Syntax ERROR:", error);
    } else {
        console.log("Syntax is VALID! Returned:", data?.length, "rows.");
    }
}
test();
