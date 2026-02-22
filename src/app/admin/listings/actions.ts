"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/utils/auth-check";
import { revalidatePath } from "next/cache";

export async function deleteListing(listingId: string) {
    // 1. Verificar permisos de admin a través de la sesión del usuario
    if (!await isAdmin()) {
        throw new Error("No autorizado");
    }

    // Usar SERVICE_ROLE_KEY para ignorar RLS en el borrado, ya que un administrador 
    // debe poder borrar anuncios independientemente de la política `auth.uid() = user_id`
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Obtener los datos del anuncio antes de borrar (para las fotos)
    const { data: listing, error: fetchError } = await supabaseAdmin
        .from("listings")
        .select("image_urls")
        .eq("id", listingId)
        .single();

    if (fetchError || !listing) {
        console.error("Error al recuperar el anuncio:", fetchError);
        return { success: false, error: "Anuncio no encontrado" };
    }

    // 3. Borrar de la base de datos (con admin client)
    const { error: deleteError } = await supabaseAdmin
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
            const parts = url.split('/public/listings/');
            return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean) as string[];

        if (filePaths.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage
                .from("listings")
                .remove(filePaths);

            if (storageError) {
                console.error("Error al limpiar Storage:", storageError);
            } else {
                console.log(`🧹 Limpieza de storage exitosa: ${filePaths.length} archivos eliminados.`);
            }
        }
    }

    revalidatePath("/admin/listings");
    revalidatePath("/"); // También refrescar la home
    return { success: true };
}
