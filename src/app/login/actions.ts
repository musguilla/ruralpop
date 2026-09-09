"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    // Se asume validación previa básica desde frontend
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const redirectTo = (formData.get("redirectTo") as string | null) || null;

    if (!email || !password) {
        redirect("/login?error=Se requieren email y contraseña");
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login error:", error);
        let errorMsg = error.message;
        
        if (error.message === "Email not confirmed") {
            errorMsg = "Debes validar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada o carpeta de spam y pincha en el enlace que te hemos enviado.";
        }
        
        const returnUrl = redirectTo 
            ? `/login?redirectTo=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(errorMsg)}` 
            : `/login?error=${encodeURIComponent(errorMsg)}`;
        redirect(returnUrl);
    }

    // Determine target redirect
    let target = redirectTo || "/";
    if (authData?.user) {
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single();
        
        if (profile?.role === "admin" && (!redirectTo || redirectTo === "/")) {
            target = "/admin";
        }
    }

    revalidatePath("/", "page");
    redirect(target);
}
