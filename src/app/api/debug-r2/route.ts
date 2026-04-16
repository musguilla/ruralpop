import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });

  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName!,
    Prefix: `tractores/Massey Ferguson/`,
  });

  const res = await s3Client.send(listCommand);
  const files = res.Contents?.map(c => c.Key) || [];

  const checkUrls = await Promise.all(
    files.filter(f => f && f.endsWith('.jpg')).slice(0, 3).map(async key => {
        const parts = (key as string).split('/');
        const filename = parts[parts.length - 1];
        const encodedURL = `${process.env.NEXT_PUBLIC_R2_URL}/tractores/${encodeURIComponent("Massey Ferguson")}/${encodeURIComponent(filename)}`;
        
        const fetchRes = await fetch(encodedURL, { method: "HEAD" });
        return {
            key,
            url: encodedURL,
            status: fetchRes.status
        };
    })
  );

  return NextResponse.json({ checkUrls });
}
