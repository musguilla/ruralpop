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

async function migrateMagazine() {
  console.log("🚀 Iniciando Migración CMS (Magazine) a R2...\n");

  const { data: posts, error } = await supabase
    .from('magazine_posts')
    .select('id, image_url, title');

  if (error) {
    console.error("Error al obtener posts:", error);
    return;
  }

  console.log(`Encontrados ${posts.length} posts del CMS.`);

  for (const post of posts) {
    const url = post.image_url;
    if (!url) continue;

    console.log(`\n📰 Procesando: ${post.title}`);

    if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
       console.log(` ⏭️ Saltando (ya está migrado a R2): ${url}`);
       continue;
    }

    // Fix absolute supabase paths
    let fetchUrl = url;
    if (!fetchUrl.startsWith('http')) {
       fetchUrl = `${supabaseUrl}/storage/v1/object/public/${fetchUrl}`;
    }

    console.log(` 📥 Descargando: ${fetchUrl}`);
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        const fileNameMatches = fetchUrl.split('/');
        const fileName = fileNameMatches[fileNameMatches.length - 1].split('?')[0]; // strip ?token
        const r2FilePath = `cms/${fileName}`;

        console.log(` 📤 Subiendo a R2 [${r2FilePath}]...`);
        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2FilePath,
            Body: buffer,
            ContentType: mimeType,
        }));

        const finalR2Url = `${NEXT_PUBLIC_R2_URL}/${r2FilePath}`;
        
        console.log(` 📝 Actualizando BBDD con URL R2...`);
        const { error: dbError } = await supabase
            .from('magazine_posts')
            .update({ image_url: finalR2Url })
            .eq('id', post.id);

        if (dbError) throw dbError;
        console.log(` ✅ Post '${post.title}' migrado a R2 con éxito.`);
    } catch (err) {
        console.error(` ❌ Error procesando ${post.title}:`, err);
    }
  }
  console.log("\n🎉 Migración de CMS finalizada.");
}

migrateMagazine().catch(console.error);
