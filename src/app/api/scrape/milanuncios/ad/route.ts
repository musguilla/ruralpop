import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url, cookie, category, subcategory } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Falta proporcionar la URL" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Sesión no válida o expirada. Refresca la página del administrador." }, { status: 401 });
        }

        // Simular headers
        const headers: any = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        };

        if (cookie) {
            headers["Cookie"] = cookie;
        }

        // 1. Fetch de la URL pública del anuncio
        console.log("Fetching MA AD:", url);
        const response = await fetch(url, { headers, method: 'GET' });
        if (!response.ok) {
            return NextResponse.json({ error: `Milanuncios respondió con HTTP ${response.status} en el anuncio` }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 2. Extraer Ad ID
        const match = url.match(/-([0-9]+)\.htm/i);
        const adId = match ? match[1] : null;

        // 3. Extracción de Datos Genéricos
        let title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr("content") || "Anuncio Importado";

        let description = $('p[class*="description"]').text().trim() || $('meta[name="description"]').attr("content") || "Sin descripción.";

        const priceText = $('span[class*="price"]').first().text().trim().replace(/[^0-9,.]/g, '') || "0";
        const price = parseFloat(priceText.replace('.', '').replace(',', '.')) || 0;

        let locationText = $('span[class*="location"]').first().text().trim() || "España";

        let sellerName = $('[class*="sellerName"], .ma-AdCard-sellerName, .ma-AdProfessional-name, p[class*="name"]').first().text().trim() || "Usuario Externo";

        // Imágenes
        const imageUrlsRaw = new Set<string>();
        $('img[class*="slider"], img[class*="photo"], img.photoviewer-img').each((_, el) => {
            let src = $(el).attr('src') || $(el).attr('data-src');
            // Filtrar iconos/avatares
            if (src && src.startsWith('http') && !src.includes('avatar') && !src.includes('logo')) {
                // Aumentar calidad si es posible, muchas veces quitando /1/ por /5/ o similar. No lo tocaremos para no romper la URL.
                imageUrlsRaw.add(src);
            }
        });

        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) imageUrlsRaw.add(ogImage);

        const imageUrls = Array.from(imageUrlsRaw).filter(url => url.includes('milanuncios') && url.includes('ft')); // Solo fotos del anuncio

        // 4. Extracción de Teléfono (API interna simulada)
        let phone = "";
        if (adId && cookie) {
            try {
                // Intento genérico a APIs conocidas de contacto de MA
                const phoneRes = await fetch(`https://www.milanuncios.com/api/contacts/phones?adId=${adId}`, { headers });
                if (phoneRes.ok) {
                    const phoneData = await phoneRes.json();
                    if (phoneData.phone) phone = phoneData.phone;
                    if (phoneData.phones && phoneData.phones[0]) phone = phoneData.phones[0];
                }
            } catch (e) {
                console.error("No se pudo obtener el teléfono para adId:", adId);
            }
        }

        // Modificamos la descripción para inyectar datos del vendedor
        const finalDescription = `${description}\n\n---\n**Datos de Contacto Milanuncios**\nVendedor: ${sellerName}\n${phone ? `Teléfono: ${phone}` : 'Teléfono no disponible (Comprueba las peticiones y cookies).'}`;

        // 5. Descarga y Subida de Imágenes a Supabase
        const uploadTasks = imageUrls.slice(0, 5).map(async (imgUrl) => { // Limitado a 5 fotos para velocidad
            try {
                const imgRes = await fetch(imgUrl);
                const arrayBuffer = await imgRes.arrayBuffer();
                const fileName = `import_${adId || Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    return null;
                }

                return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${fileName}`;
            } catch (err) {
                console.error("Error procesando imagen:", imgUrl, err);
                return null;
            }
        });

        let finalImageUrls = (await Promise.all(uploadTasks)).filter(url => url !== null) as string[];

        // 6. Inserción en Base de Datos
        const { data: insertedData, error: insertError } = await supabase
            .from("listings")
            .insert({
                title,
                description: finalDescription,
                price,
                location: locationText,
                category: category || "Importados",
                subcategory: subcategory || null,
                price_type: "fixed",
                image_urls: finalImageUrls,
                user_id: user.id, // Asignar al admin que importa
                status: "moderated" // Por defecto en moderación para revisarlos
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: `Error en Base de datos: ${insertError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                title,
                sellerName,
                phone,
                imagesCount: finalImageUrls.length
            }
        });

    } catch (error: any) {
        console.error("Scraper Ad Error:", error);
        return NextResponse.json({ error: "Error interno procesando el anuncio en concreto" }, { status: 500 });
    }
}
