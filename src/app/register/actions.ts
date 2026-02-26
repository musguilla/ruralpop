"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (!email || !password || !name) {
        redirect("/register?error=Todos los campos son obligatorios");
    }

    if (password !== passwordConfirm) {
        redirect("/register?error=Las contraseñas no coinciden, por favor verifica.");
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            },
        }
    });

    if (error) {
        console.error("Signup error:", error);
        redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }

    // Notamos que la creación del perfil en DB se hace mediante el trigger SQL automatizado.
    revalidatePath("/", "layout");
    redirect("/login?message=Revisa tu correo electrónico para verificar tu cuenta, o inicia sesión si la verificación está deshabilitada.");
}
