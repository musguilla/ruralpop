import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación con Supabase para evitar subidas de gente anónima
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // NOTA: Para RURALPOP decidimos permitir subidas sin auth si es para publicar un anuncio anónimo o público temporalmente, 
    // pero si te interesa protegerlo, descomenta:
    // Opcionalmente podemos requerir autenticacion:
    // if (authError || !user) {
    //  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { filename, contentType, folder = 'listings' } = body;

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }

    // 2. Configurar el SDK de S3 apuntando a Cloudflare R2
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Missing R2 environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // 3. Generar un path único con marca de tiempo o aleatorio
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const date = new Date();
    const yearMonth = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const filePath = `${folder}/${yearMonth}/${uniqueId}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 4. Crear el comando PutObject
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: contentType, // Esencial para que el navegador decodifique la imagen
    });

    // 5. Firmar URL (válida por 5 minutos)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // 6. Retornar la URL firmada y la URL pública final
    const publicBaseUrl = process.env.NEXT_PUBLIC_R2_URL || `https://media.ruralpop.com`;
    const cleanBaseUrl = publicBaseUrl.replace(/\/+$/, '');
    const cleanPath = filePath.replace(/^\/+/, '');
    const finalPublicUrl = `${cleanBaseUrl}/${cleanPath}`;

    return NextResponse.json({
      presignedUrl: signedUrl,
      publicUrl: finalPublicUrl,
      filePath: filePath,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
