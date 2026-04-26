import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/app/tienda/[slug]/page.tsx';
let content = readFileSync(filePath, 'utf-8');

if (!content.includes('generateStaticParams')) {
  const insertIndex = content.indexOf('export async function generateMetadata');
  
  const staticParamsCode = `
export const revalidate = 3600; // Revalidar cada hora

export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
        .from('products')
        .select('slug')
        .eq('status', 'active');

    return (products || []).map((p) => ({
        slug: p.slug,
    }));
}

`;
  content = content.slice(0, insertIndex) + staticParamsCode + content.slice(insertIndex);
  writeFileSync(filePath, content);
  console.log("Added generateStaticParams");
}
