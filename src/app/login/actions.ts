"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    // Se asume validación previa básica desde frontend
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const redirectTo = (formData.get("redirectTo") as string | null) || null;
    const formLocale = (formData.get("locale") as string | null) || null;

    const headersList = await headers();
    const headerLocale = headersList.get("x-locale");
    const isPt = formLocale === "pt" || headerLocale === "pt";
    const loginBase = isPt ? "/pt/login" : "/login";

    if (!email || !password) {
        const errorMsg = isPt ? "Email e palavra-passe são obrigatórios" : "Se requieren email y contraseña";
        const returnUrl = redirectTo
            ? `${loginBase}?redirectTo=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(errorMsg)}`
            : `${loginBase}?error=${encodeURIComponent(errorMsg)}`;
        redirect(returnUrl);
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login error:", error);
        let errorMsg = error.message;

        if (error.message === "Email not confirmed") {
            errorMsg = isPt
                ? "Deve validar o seu email antes de aceder. Verifique a sua caixa de entrada ou pasta de spam e clique no link que lhe enviámos."
                : "Debes validar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada o carpeta de spam y pincha en el enlace que te hemos enviado.";
        } else if (error.message === "Invalid login credentials") {
            errorMsg = isPt
                ? "Credenciais de acesso inválidas. Verifique o seu email e palavra-passe."
                : "Credenciales de acceso no válidas. Por favor, revisa tu email y contraseña.";
        }

        const returnUrl = redirectTo 
            ? `${loginBase}?redirectTo=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(errorMsg)}` 
            : `${loginBase}?error=${encodeURIComponent(errorMsg)}`;
        redirect(returnUrl);
    }

    // Determine target redirect
    let target = redirectTo;

    if (authData?.user) {
        const { data: profile } = await supabase
            .from("users")
            .select("role, province_id, company_country")
            .eq("id", authData.user.id)
            .single();

        const userIsPt = isPt || 
            (profile?.province_id !== null && Number(profile?.province_id) >= 100) ||
            profile?.company_country === "PT" ||
            authData.user.user_metadata?.locale === "pt";

        if (profile?.role === "admin" && (!redirectTo || redirectTo === "/" || redirectTo === "/pt")) {
            target = "/admin";
        } else if (!target || target === "/" || target === "/pt") {
            target = userIsPt ? "/pt" : "/";
        } else if (userIsPt && !target.startsWith("/pt") && target.startsWith("/") && target !== "/admin") {
            // Keep user on Portuguese version of the requested page
            target = `/pt${target}`;
        }
    } else {
        if (!target) {
            target = isPt ? "/pt" : "/";
        }
    }

    try {
        revalidatePath("/", "page");
        revalidatePath("/pt", "page");
    } catch (e) {
        console.error("revalidatePath error:", e);
    }

    redirect(target);
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Preservación de Locale en Login: Cuando un usuario se autentica desde Portugal
 *      o posee un perfil portugués (province_id >= 100 o metadata locale='pt'),
 *      la redirección por defecto tras el login se fija en `/pt` y no en la raíz española `/`.
 *    - Manejo de Mensajes de Error Localizados: Mensajes de correo no confirmado o credenciales
 *      inválidas se muestran en portugués si la solicitud provino de `/pt`.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Usuario logueado con email de .com navegando en /pt: Si estaba en /pt, no se le expulsa
 *      a la versión en español; permanece en /pt.
 *    - Usuarios con rol 'admin': Mantienen prioridad hacia '/admin' independientemente del locale.
 *    - Preservación estricta de `redirectTo`: Si venía de `/pt/upload`, vuelve directamente allí.
 * -----------------------------------------------------------------------------
 */
