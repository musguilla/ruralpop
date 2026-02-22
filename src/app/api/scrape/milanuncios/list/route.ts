import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Falta proporcionar la URL" }, { status: 400 });
        }

        // Simular headers de navegador real para evitar bloqueos
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Cache-Control": "max-age=0",
        };

        const response = await fetch(url, { headers });
        if (!response.ok) {
            return NextResponse.json({ error: `Milanuncios respondió con HTTP ${response.status}` }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Milanuncios ads are usually wrapped in specific a tags or we can find __NEXT_DATA__
        // A generic approach: find all links ending with ID.htm in the main grid
        const urls = new Set<string>();

        // Method 1: Search links directly
        $("a").each((_, el) => {
            const href = $(el).attr("href");
            if (href && href.match(/-[0-9]{8,12}\.htm$/)) {
                // Ensure it's an absolute URL
                const fullUrl = href.startsWith("http") ? href : `https://www.milanuncios.com${href.startsWith('/') ? '' : '/'}${href}`;
                urls.add(fullUrl);
            }
        });

        const adUrls = Array.from(urls);

        return NextResponse.json({ adUrls });

    } catch (error: any) {
        console.error("Scraper List Error:", error);
        return NextResponse.json({ error: "Error interno procesando listado" }, { status: 500 });
    }
}
