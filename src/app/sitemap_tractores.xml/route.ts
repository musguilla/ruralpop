import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getTractorFormattedName, generateTractorFriendlySlug } from "@/lib/tractores-data";

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addEntry = (path: string, priority: number = 0.8) => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${path}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
    };

    addEntry('/tractores', 0.9);
    
    const BRANDS_MAP: Record<string, string> = {
        "case": "Case",
        "john-deere": "John Deere",
        "lamborghini": "Lamborghini",
        "massey-ferguson": "Massey Ferguson",
        "mc-cormick": "Mc Cormick",
        "new-holland": "New Holland",
    };

    if (process.env.R2_ACCOUNT_ID) {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
            },
        });

        for (const [brandSlug, folderName] of Object.entries(BRANDS_MAP)) {
            addEntry(`/tractores/${brandSlug}`, 0.85);

            try {
                const listCommand = new ListObjectsV2Command({
                    Bucket: process.env.R2_BUCKET_NAME || "",
                    Prefix: `tractores/${folderName}/`,
                });
                const { Contents } = await s3Client.send(listCommand);

                if (Contents) {
                    const uniqueModels = new Set<string>();

                    Contents.forEach(c => {
                        const name = c.Key?.split('/').pop() || "";
                        if (name && name !== ".emptyFolderPlaceholder" && !name.startsWith(".")) {
                            const fName = getTractorFormattedName(name);
                            if (fName !== "__IGNORE__") {
                                const fSlug = generateTractorFriendlySlug(fName);
                                uniqueModels.add(fSlug);
                            }
                        }
                    });

                    uniqueModels.forEach(modelSlug => {
                        addEntry(`/tractores/${brandSlug}/${modelSlug}`, 0.8);
                    });
                }
            } catch (err) {
                console.error(`Sitemap Tractores: Error fetching tractor models for ${brandSlug}:`, err);
            }
        }
    } else {
        xml += `  <!-- Error: faltan credenciales R2 en el servidor -->\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
