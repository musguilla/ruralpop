import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("Set SUPABASE_SERVICE_ROLE_KEY to run this script.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔄 Iniciando unificación de imágenes en la carpeta "listings/"...');

    // 1. Obtener todos los anuncios
    const { data: listings, error } = await supabase.from('listings').select('id, image_urls');
    if (error) {
        console.error('❌ Error al obtener los anuncios:', error.message);
        return;
    }

    console.log(`Encontrados ${listings.length} anuncios. Revisando URLs...`);

    // Para evitar sobrecarga, procesamos uno a uno
    for (const item of listings) {
        if (!item.image_urls || item.image_urls.length === 0) continue;

        let updated = false;
        const newUrls = [];

        for (const currentUrl of item.image_urls) {
            // url example: "https://.../storage/v1/object/public/listings/vacas-asturias/file.jpg"
            // we need to extract the path after the bucket 'listings'
            const parts = currentUrl.split('/public/listings/');
            if (parts.length < 2) {
                newUrls.push(currentUrl); // No sabemos qué es, lo dejamos
                continue;
            }

            const filePath = parts[1]; // ej: "vacas-asturias/vaca_123.jpg" o "listings/algo.jpg" o incluso root "algo.jpg"

            // Si no está en la carpeta "listings", lo movemos
            if (!filePath.startsWith('listings/')) {
                const fileName = filePath.split('/').pop();
                const newPath = `listings/${fileName}`;
                const newFullUrl = currentUrl.replace(`/public/listings/${filePath}`, `/public/listings/${newPath}`);

                console.log(`  ↪ Moviendo: ${filePath} -> ${newPath}`);

                // Intentar mover en Storage
                const { data: moveData, error: moveError } = await supabase.storage
                    .from('listings')
                    .move(filePath, newPath);

                if (moveError && !moveError.message.includes('already exists')) {
                    console.error(`  ❌ Error al mover ${filePath}:`, moveError.message);
                    newUrls.push(currentUrl); // Si falla, mantenemos la original
                } else {
                    newUrls.push(newFullUrl);
                    updated = true;
                    console.log(`    ✅ Movido.`);
                }
            } else {
                newUrls.push(currentUrl);
            }
        }

        if (updated) {
            const { error: updateError } = await supabase
                .from('listings')
                .update({ image_urls: newUrls })
                .eq('id', item.id);

            if (updateError) {
                console.error(`  ❌ Error actualizando BD (ID: ${item.id}):`, updateError.message);
            } else {
                console.log(`  💾 BD actualizada para anuncio ID: ${item.id}`);
            }
        }
    }

    console.log('\n🧹 Intentando borrar las carpetas antiguas vacías...');

    // En Supabase, las "carpetas" son solo prefijos. 
    // No se pueden borrar carpetas directamente si no están vacías, pero si están vacías,
    // el cliente o la UI las deja de mostrar. Sin embargo, revisaremos todos los archivos
    // para borrar cualquier archivo residual en las carpetas.

    const foldersToClean = ['scraped', 'vacas-asturias', 'yeguas', 'yeguas-v2', 'sementales'];

    for (const folder of foldersToClean) {
        const { data: files, error: listError } = await supabase.storage.from('listings').list(folder);
        if (listError) {
            console.log(`Error listando la carpeta ${folder}:`, listError.message);
            continue;
        }

        if (files && files.length > 0) {
            const filePathsToDelete = files.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => `${folder}/${f.name}`);
            if (filePathsToDelete.length > 0) {
                console.log(`  🗑️  Borrando ${filePathsToDelete.length} archivos residuales en ${folder}...`);
                const { error: deleteError } = await supabase.storage.from('listings').remove(filePathsToDelete);
                if (deleteError) {
                    console.error(`    ❌ Error borrando archivos en ${folder}:`, deleteError.message);
                } else {
                    console.log(`    ✅ Archivos residuales en ${folder} borrados.`);
                }
            }
        } else {
            console.log(`  📂 La carpeta ${folder} ya está vacía o no existe.`);
        }
    }

    console.log('\n🎉 ¡Proceso de unificación terminado!');
}

main().catch(console.error);
