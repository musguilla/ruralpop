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

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function migrateTractoresBucket() {
  console.log("🚀 Iniciando Migración Completa del Bucket 'tractores' a R2...\n");

  const folders = [
      "Case", "John Deere", "Lamborghini", "Massey Ferguson", "Mc Cormick", "New Holland"
  ];

  for (const folder of folders) {
      console.log(`\n📁 Analizando carpeta: ${folder}`);
      
      const { data: files, error } = await supabase.storage
          .from("tractores")
          .list(folder, { limit: 1000 });

      if (error) {
          console.error(`Error al listar archivos de ${folder}:`, error);
          continue;
      }

      console.log(` -> Encontrados ${files.length} ficheros.`);

      for (const file of files) {
          if (file.name === ".emptyFolderPlaceholder" || file.name.startsWith(".")) continue;

          const filePath = `${folder}/${file.name}`;
          const r2FilePath = `tractores/${filePath}`;
          const publicUrl = supabase.storage.from("tractores").getPublicUrl(filePath).data.publicUrl;
          
          console.log(` 📥 Descargando: ${filePath}`);
          try {
              const response = await fetch(publicUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const mimeType = response.headers.get('content-type') || 'application/octet-stream';

              console.log(` 📤 Subiendo a R2 [${r2FilePath}]...`);
              await s3Client.send(new PutObjectCommand({
                  Bucket: R2_BUCKET_NAME,
                  Key: r2FilePath,
                  Body: buffer,
                  ContentType: mimeType,
              }));

              console.log(` ✅ Hecho.`);
          } catch(err) {
              console.error(` ❌ Error con ${filePath}:`, err.message);
          }
      }
  }

  console.log("\n🎉 Migración del Bucket 'tractores' finalizada.");
}

migrateTractoresBucket().catch(console.error);
