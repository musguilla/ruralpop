import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const NEXT_PUBLIC_R2_URL = process.env.NEXT_PUBLIC_R2_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function migrateListings() {
  console.log("🚀 Iniciando Migración Anuncios (Listings) a R2...\n");

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, image_urls, title')
    .not('image_urls', 'is', null);

  if (error) {
    console.error("Error al obtener listings:", error);
    return;
  }

  console.log(`Encontrados ${listings.length} anuncios.`);

  for (const listing of listings) {
    console.log(`\n🚜 Procesando: ${listing.title}`);
    const imageUrls = listing.image_urls || [];
    let updatedImageUrls = [...imageUrls];
    let hasChanges = false;

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (!url) continue;

        if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
           console.log(` ⏭️ Saltando (ya en R2): ${url}`);
           continue;
        }

        let fetchUrl = url;
        if (!fetchUrl.startsWith('http')) {
           fetchUrl = `${supabaseUrl}/storage/v1/object/public/${fetchUrl}`;
        }

        console.log(` 📥 Descargando (${i+1}/${imageUrls.length}): ${fetchUrl}`);
        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get('content-type') || 'image/jpeg';
            
            const fileNameMatches = fetchUrl.split('/');
            const fileName = fileNameMatches[fileNameMatches.length - 1].split('?')[0];
            const r2FilePath = `listings/${fileName}`;

            console.log(` 📤 Subiendo a R2 [${r2FilePath}]...`);
            await s3Client.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: r2FilePath,
                Body: buffer,
                ContentType: mimeType,
            }));

            updatedImageUrls[i] = `${NEXT_PUBLIC_R2_URL}/${r2FilePath}`;
            hasChanges = true;
        } catch (err) {
            console.error(` ❌ Error procesando miniatura en ${listing.title}:`, err.message);
        }
    }

    if (hasChanges) {
        console.log(` 📝 Actualizando DB para Anuncio '${listing.title}'...`);
        const { error: dbError } = await supabase
            .from('listings')
            .update({ image_urls: updatedImageUrls })
            .eq('id', listing.id);

        if (dbError) console.error("Error de DB:", dbError);
        else console.log(` ✅ Listo.`);
    }
  }
  console.log("\n🎉 Migración de Listings finalizada.");
}

migrateListings().catch(console.error);
