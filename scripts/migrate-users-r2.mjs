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

async function migrateUsersAvatars() {
  console.log("🚀 Iniciando Migración Avatares a R2...\n");

  const { data: users, error } = await supabase
    .from('users')
    .select('id, avatar_url, name')
    .not('avatar_url', 'is', null);

  if (error) {
    console.error("Error al obtener usuarios:", error);
    return;
  }

  console.log(`Encontrados ${users.length} usuarios con avatar_url.`);

  for (const user of users) {
    const url = user.avatar_url;
    if (!url) continue;

    console.log(`\n👤 Procesando Avatar de: ${user.name || user.id}`);

    if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
       console.log(` ⏭️ Saltando (ya migrado): ${url}`);
       continue;
    }

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
        
        // El filename en Supabase users suele ser "uuid/avatar_xxxxx.jpg"
        // Construimos un key seguro para R2.
        const r2FilePath = `users/${user.id}-avatar-${Date.now()}.jpg`;

        console.log(` 📤 Subiendo a R2 [${r2FilePath}]...`);
        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2FilePath,
            Body: buffer,
            ContentType: mimeType,
        }));

        const finalR2Url = `${NEXT_PUBLIC_R2_URL}/${r2FilePath}`;
        
        console.log(` 📝 Actualizando BBDD users con URL R2...`);
        // Actualizar base de datos publica
        const { error: dbError } = await supabase
            .from('users')
            .update({ avatar_url: finalR2Url })
            .eq('id', user.id);

        if (dbError) throw dbError;

        // Actualizar Auth Metadata (requiere token de superusuario)
        const { data: authData, error: authGetError } = await supabase.auth.admin.getUserById(user.id);
        if (!authGetError && authData.user) {
             await supabase.auth.admin.updateUserById(user.id, {
                 user_metadata: { ...authData.user.user_metadata, avatar_url: finalR2Url }
             });
        }

        console.log(` ✅ Avatar de '${user.name}' migrado con éxito.`);
    } catch (err) {
        console.error(` ❌ Error procesando avatar - ${user.name}:`, err.message);
    }
  }
  console.log("\n🎉 Migración de Avatares finalizada.");
}

migrateUsersAvatars().catch(console.error);
