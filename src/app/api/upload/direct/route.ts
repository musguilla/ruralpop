import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "listings";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
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

    // 3. Generar un path único
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const date = new Date();
    const yearMonth = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const filename = file.name || "image.webp";
    const filePath = `${folder}/${yearMonth}/${uniqueId}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Subir directamente a R2 desde el servidor (evitando bloqueos en el cliente)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: file.type || "image/webp",
      Body: buffer,
    });

    await s3Client.send(command);

    // 5. Retornar la URL pública final
    const publicBaseUrl = process.env.NEXT_PUBLIC_R2_URL || `https://media.ruralpop.com`;
    const cleanBaseUrl = publicBaseUrl.replace(/\/+$/, '');
    const cleanPath = filePath.replace(/^\/+/, '');
    const finalPublicUrl = `${cleanBaseUrl}/${cleanPath}`;

    return NextResponse.json({
      publicUrl: finalPublicUrl,
      filePath: filePath,
    });
  } catch (error) {
    console.error("Error uploading direct to R2:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
