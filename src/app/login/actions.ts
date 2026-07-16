"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    // Se asume validación previa básica desde frontend
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        redirect("/login?error=Se requieren email y contraseña");
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login error:", error);
        let errorMsg = error.message;
        
        if (error.message === "Email not confirmed") {
            errorMsg = "Debes validar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada o carpeta de spam y pincha en el enlace que te hemos enviado.";
        }
        
        redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
    }

    revalidatePath("/", "layout");
    redirect("/");
}
