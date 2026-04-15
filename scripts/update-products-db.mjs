import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDb() {
  console.log("🚀 Actualizando DB de Productos (Columna JSON Media)...");
  
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) throw error;
  
  for (const product of products) {
    const imageUrls = product.image_urls || [];
    const mediaArray = [];
    
    for (const url of imageUrls) {
       const fileNameMatches = url.split('/');
       const fileName = fileNameMatches[fileNameMatches.length - 1];
       mediaArray.push({
           storage_provider: 'r2',
           storage_path: `products/${fileName}`,
           mime_type: 'image/jpeg'
       });
    }
    
    // update media column
    const { error: updateError } = await supabase
       .from('products')
       .update({ media: mediaArray })
       .eq('id', product.id);
       
    if(updateError) console.error("Error updated", product.title, updateError);
    else console.log(`✅ DB Actualizada: ${product.title}`);
  }
}

updateDb().catch(console.error);
