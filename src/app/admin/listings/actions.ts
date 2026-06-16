"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/utils/auth-check";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

export async function deleteListing(listingId: string) {
    // 1. Verificar permisos de admin a través de la sesión del usuario
    if (!await isAdmin()) {
        return { success: false, error: "No estás autorizado para realizar esta acción." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Faltan variables de entorno para inicializar Supabase Admin.");
        return { success: false, error: "Error de configuración de servidor." };
    }

    // Usar SERVICE_ROLE_KEY para ignorar RLS en el borrado, ya que un administrador 
    // debe poder borrar anuncios independientemente de la política `auth.uid() = user_id`
    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    } catch (err) {
        console.error("Error creando cliente supabaseAdmin:", err);
        return { success: false, error: "Hubo un error inicializando cliente backend." };
    }

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

export async function adminUpdateListing(listingId: string, formData: FormData) {
    if (!await isAdmin()) {
        return { error: "No estás autorizado para realizar esta acción." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return { error: "Error de configuración de servidor." };
    }

    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    } catch (err) {
        return { error: "Hubo un error inicializando cliente backend." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const location = formData.get("location") as string;

    const provStr = formData.get("province_id") as string;
    const muniStr = formData.get("municipality_id") as string;
    const province_id = provStr ? parseInt(provStr, 10) : null;
    const municipality_id = muniStr ? parseInt(muniStr, 10) : null;

    const contact_phone = formData.get("contact_phone") as string | null;
    const price_type = formData.get("price_type") as string;
    const vender_online = formData.get("vender_online") === "on";
    const imageUrlsString = formData.get("image_urls") as string;
    const image_urls = imageUrlsString ? JSON.parse(imageUrlsString) : [];
    
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? JSON.parse(tagsString) : [];

    const { error } = await supabaseAdmin
        .from("listings")
        .update({
            title,
            description,
            price,
            category,
            subcategory: subcategory || null,
            location,
            province_id,
            municipality_id,
            price_type,
            image_urls,
            contact_phone,
            vender_online,
            tags
        })
        .eq("id", listingId);

    if (error) {
        console.error("Error updating listing via admin:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/listings");
    revalidatePath("/");
    revalidatePath(`/anuncio/anuncio-${listingId.substring(0, 8)}`);

    return { success: true };
}

import { EMAIL_TEMPLATES } from "@/constants/emailTemplates";

export async function deleteListingAndSendEmail(listingId: string, email: string, reason: 'no_aplica' | 'bienestar_animal') {
    if (!await isAdmin()) {
        return { success: false, error: "No estás autorizado para realizar esta acción." };
    }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY no configurado." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const templateId = reason === 'no_aplica' ? 'no-aplica-anuncio' : 'ley-bienestar-animal';
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
        return { success: false, error: "Plantilla no encontrada." };
    }

    try {
        const { error: resendError } = await resend.emails.send({
            from: "Soporte Ruralpop <soporte@ruralpop.com>",
            to: email,
            subject: template.subject,
            html: template.htmlContent.replace('{{LISTING_ID}}', listingId)
        });

        if (resendError) {
            console.error("Error sending email:", resendError);
        }
    } catch (e) {
        console.error("Resend catch error:", e);
    }

    if (reason === 'bienestar_animal') {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey) {
            const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
            await supabaseAdmin.from('listings').update({ status: 'draft' }).eq('id', listingId);
            revalidatePath("/admin/listings");
            revalidatePath("/");
            revalidatePath(`/anuncio/anuncio-${listingId.substring(0, 8)}`);
            return { success: true };
        }
    }

    return await deleteListing(listingId);
}

export async function activateListing(listingId: string) {
    if (!await isAdmin()) {
        return { success: false, error: "No estás autorizado para realizar esta acción." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return { success: false, error: "Error de configuración de servidor." };
    }

    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    } catch (err) {
        return { success: false, error: "Hubo un error inicializando cliente backend." };
    }

    const { error } = await supabaseAdmin
        .from("listings")
        .update({ status: 'active' })
        .eq("id", listingId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/listings");
    revalidatePath("/");
    revalidatePath(`/anuncio/anuncio-${listingId.substring(0, 8)}`);

    return { success: true };
}

export async function deleteMultipleListings(listingIds: string[]) {
    if (!await isAdmin()) {
        return { success: false, error: "No estás autorizado para realizar esta acción." };
    }

    if (!listingIds || listingIds.length === 0) {
        return { success: false, error: "No se proporcionaron anuncios para borrar." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Faltan variables de entorno para inicializar Supabase Admin.");
        return { success: false, error: "Error de configuración de servidor." };
    }

    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    } catch (err) {
        console.error("Error creando cliente supabaseAdmin:", err);
        return { success: false, error: "Hubo un error inicializando cliente backend." };
    }

    // 1. Obtener las imágenes de todos los anuncios a borrar
    const { data: listings, error: fetchError } = await supabaseAdmin
        .from("listings")
        .select("id, image_urls")
        .in("id", listingIds);

    if (fetchError) {
        console.error("Error al recuperar los anuncios para borrado masivo:", fetchError);
        return { success: false, error: "Error al leer los anuncios seleccionados." };
    }

    if (!listings || listings.length === 0) {
        return { success: true }; // Ya estaban borrados
    }

    // 2. Borrar de la base de datos
    const { error: deleteError } = await supabaseAdmin
        .from("listings")
        .delete()
        .in("id", listingIds);

    if (deleteError) {
        console.error("Error en borrado masivo DB:", deleteError);
        return { success: false, error: deleteError.message };
    }

    // 3. Borrar imágenes del bucket
    const filePaths: string[] = [];
    for (const listing of listings) {
        if (listing.image_urls && Array.isArray(listing.image_urls)) {
            for (const url of listing.image_urls) {
                const parts = url.split('/public/listings/');
                if (parts.length > 1 && parts[1]) {
                    filePaths.push(parts[1]);
                }
            }
        }
    }

    if (filePaths.length > 0) {
        // Supabase allows bulk removal but there might be a limit (e.g. 100).
        // For our use case (bulk delete from a page of 40), it should be fine to do it in one go.
        const { error: storageError } = await supabaseAdmin.storage
            .from("listings")
            .remove(filePaths);

        if (storageError) {
            console.error("Error en limpieza masiva de Storage:", storageError);
        } else {
            console.log(`🧹 Limpieza masiva de storage exitosa: ${filePaths.length} archivos eliminados.`);
        }
    }

    revalidatePath("/admin/listings");
    revalidatePath("/");
    
    return { success: true };
}
