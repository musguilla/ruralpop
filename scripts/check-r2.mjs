import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: `tractores/Massey Ferguson/`,
  });
  const res = await s3Client.send(listCommand);
  console.log("Keys found:");
  const keys = res.Contents?.map(c => c.Key).slice(0, 10);
  console.log(keys);

  if (keys && keys.length > 0) {
      for (const k of keys) {
         if (k.endsWith('.jpg')) {
             const filename = k.split('/').pop() || "";
             const encodedURL = `${process.env.NEXT_PUBLIC_R2_URL}/tractores/${encodeURIComponent("Massey Ferguson")}/${encodeURIComponent(filename)}`;
             console.log("Encoded URL:", encodedURL);
         }
      }
  }
}
run().catch(console.error);
