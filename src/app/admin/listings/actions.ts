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
    const imageUrlsString = formData.get("image_urls") as string;
    const image_urls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

    if (!image_urls || image_urls.length === 0) {
        return { error: "El anuncio debe tener al menos una fotografía." };
    }

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
            contact_phone
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

export async function deleteListingAndSendEmail(listingId: string, email: string, reason: 'no_aplica' | 'bienestar_animal') {
    if (!await isAdmin()) {
        return { success: false, error: "No estás autorizado para realizar esta acción." };
    }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY no configurado." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    let subject = "";
    let htmlContent = "";

    if (reason === 'no_aplica') {
        subject = "Tu anuncio ha sido eliminado de Ruralpop";
        htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2>Hola,</h2>
                <p>Te contactamos desde el equipo de moderación de Ruralpop para informarte que tu anuncio ha sido eliminado.</p>
                <p>Tras revisar el contenido, hemos determinado que no encaja en las categorías y la temática principal de nuestra plataforma, enfocada al sector agrícola, ganadero y rural.</p>
                <p>Si crees que ha sido un error, no dudes en contactarnos.</p>
                <br/>
                <p>Un saludo,</p>
                <p><strong>El equipo de Ruralpop</strong></p>
            </div>
        `;
    } else if (reason === 'bienestar_animal') {
        subject = "Importante: Tu anuncio ha sido eliminado por normativa vigente";
        htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2>Hola,</h2>
                <p>Te contactamos desde el equipo de moderación de Ruralpop para informarte que tu anuncio ha sido eliminado de la plataforma.</p>
                <p>Te recordamos que la Ley de Bienestar Animal (Ley 7/2023) en España, vigente desde el 29 de septiembre de 2023, prohíbe terminantemente la venta directa de animales de compañía (perros, gatos, hurones, roedores, pájaros) a través de Internet, portales web o aplicaciones.</p>
                <p>Para cumplir estrictamente con la legalidad, no podemos mantener este tipo de anuncios públicos.</p>
                <p>En Ruralpop estamos comprometidos con la tenencia y adquisición responsable de animales de compañía y por ello solo permitimos anuncios con número de registro del núcleo zoológico por parte de usuarios profesionales que publican con el sello de "Profesional" y cuentan con <a href="https://www.ruralpop.com/empresas-profesionales-sector-rural" style="color: #16a34a; font-weight: bold;">Ruralpop Plan Pro</a>.</p>
                <p>Agradecemos tu comprensión.</p>
                <br/>
                <p>Un saludo,</p>
                <p><strong>El equipo de Ruralpop</strong></p>
            </div>
        `;
    }

    try {
        const { error: resendError } = await resend.emails.send({
            from: "Soporte Ruralpop <soporte@ruralpop.com>",
            to: email,
            subject: subject,
            html: htmlContent
        });

        if (resendError) {
            console.error("Error sending email:", resendError);
        }
    } catch (e) {
        console.error("Resend catch error:", e);
    }

    return await deleteListing(listingId);
}
