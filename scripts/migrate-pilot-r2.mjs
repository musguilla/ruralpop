import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

// 1. Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Configurar Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function migrateProducts() {
  console.log("🚀 Iniciando Piloto: Migración de Productos a R2...\n");

  // A. Añadir la columna 'media jsonb[]' temporalmente mediante SQL RPC o hacer un alter directo.
  // Notificaremos al usuario para hacerlo si es necesario, o lo haremos mediante Query.
  
  // Extraer todos los productos para este piloto
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Error al obtener productos:", error);
    return;
  }

  console.log(`Encontrados ${products.length} productos.`);

  for (const product of products) {
    console.log(`\n📦 Procesando: ${product.title}`);
    const imageUrls = product.image_urls || [];
    const mediaArray = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        
        // Evitamos volver a procesar si ya está en r2 por una ejecución fallida previa (Idempotencia)
        if(url.includes('r2.cloudflarestorage.com')) {
           console.log(` ⏭️ Saltando (ya parece estar en R2): ${url}`);
           mediaArray.push({
               storage_provider: 'r2',
               storage_path: url, // temporalmente mientras validemos rutas publicas de R2
           });
           continue;
        }

        console.log(` 📥 Descargando (${i+1}/${imageUrls.length}): ${url}`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get('content-type') || 'image/jpeg';
            
            // Extraer el nombre de la imagen deducido de la url 
            // Ej: .../products/gorra-atardecer-tractor.jpg
            const fileNameMatches = url.split('/');
            const fileName = fileNameMatches[fileNameMatches.length - 1];
            // Path dentro de R2 (mimic al bucket products / magazine)
            const r2FilePath = `products/${fileName}`;

            console.log(` 📤 Subiendo a R2 [${r2FilePath}]...`);
            
            await s3Client.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: r2FilePath,
                Body: buffer,
                ContentType: mimeType,
            }));

            // Construir el nuevo objeto Media. 
            // Para R2 todavía NO tenemos la URL PÚBLICA configurada. Se agregará dinamicamente desde mediaUtils luego.
            mediaArray.push({
                storage_provider: 'r2',
                storage_path: r2FilePath,
                mime_type: mimeType,
                size_bytes: buffer.byteLength
            });
            console.log(` ✅ Hecho.`);

        } catch (err) {
            console.error(` ❌ Error procesando ${url}:`, err);
        }
    }

    // Aquí podríamos inyectar la actualización a Supabase
    console.log(` Preparar update en DB (creando mediaJSON o similar)...`, JSON.stringify(mediaArray, null, 2));
  }

  console.log("\n🎉 Migración del piloto lista. Revisar terminal.");
}

migrateProducts().catch(console.error);
