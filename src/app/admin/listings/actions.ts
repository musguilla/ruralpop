"use server";

import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth-check";
import { revalidatePath } from "next/cache";

export async function deleteListing(listingId: string) {
    // 1. Verificar permisos de admin
    if (!await isAdmin()) {
        throw new Error("No autorizado");
    }

    const supabase = await createClient();

    // 2. Obtener los datos del anuncio antes de borrar (para las fotos)
    const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("image_urls")
        .eq("id", listingId)
        .single();

    if (fetchError || !listing) {
        console.error("Error al recuperar el anuncio:", fetchError);
        return { success: false, error: "Anuncio no encontrado" };
    }

    // 3. Borrar de la base de datos
    // Usamos delete real como pidió el usuario
    const { error: deleteError } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId);

    if (deleteError) {
        console.error("Error al borrar el anuncio de la DB:", deleteError);
        return { success: false, error: deleteError.message };
    }

    // 4. Borrar fotos del Bucket (Optimización de espacio)
    if (listing.image_urls && listing.image_urls.length > 0) {
        const filePaths = listing.image_urls.map((url: string) => {
            // Extraer el path relativo al bucket 'listings'
            // Ejemplo URL: .../public/listings/folder/uuid.jpg -> folder/uuid.jpg
            const parts = url.split('/public/listings/');
            return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean) as string[];

        if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from("listings")
                .remove(filePaths);

            if (storageError) {
                console.error("Error al limpiar Storage:", storageError);
                // No lanzamos error aquí para no confundir al usuario, 
                // ya que el anuncio ya no existe en la DB
            } else {
                console.log(`🧹 Limpieza de storage exitosa: ${filePaths.length} archivos eliminados.`);
            }
        }
    }

    revalidatePath("/admin/listings");
    revalidatePath("/"); // También refrescar la home
    return { success: true };
}
