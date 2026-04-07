"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExchangingCode, setIsExchangingCode] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // 1. Manejo de errores por hash fragment (flujo implícito legado)
        const hash = window.location.hash;
        if (hash && hash.includes("error_description")) {
            const params = new URLSearchParams(hash.substring(1));
            setError(params.get("error_description")?.replace(/\+/g, " ") || "El enlace es inválido o ha caducado.");
        }

        // 2. Manejo de PKCE (code en query params) - Estándar en Next.js App Router con @supabase/ssr
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const urlError = searchParams.get("error_description") || searchParams.get("error");

        if (urlError) {
            setError(urlError.replace(/\+/g, " "));
        }

        if (code) {
            setIsExchangingCode(true);
            const handleExchange = async () => {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                setIsExchangingCode(false);
                
                if (exchangeError) {
                    console.error("Error validando token PKCE:", exchangeError);
                    setError("El enlace de recuperación ha caducado o ya ha sido utilizado (PKCE inválido). Por favor, solicita uno nuevo.");
                } else {
                    // Éxito: La sesión se ha establecido en las cookies.
                    // Limpiamos la URL para no dejar expuesto el token de un solo uso.
                    window.history.replaceState(null, '', window.location.pathname);
                }
            };
            handleExchange();
        }
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isExchangingCode) {
            setError("Por favor espera, estamos validando tu enlace seguro...");
            return;
        }

        if (password !== passwordConfirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsUpdating(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        setIsUpdating(false);

        if (updateError) {
            if (updateError.message.includes("session missing")) {
                setError("La sesión es inválida o ha caducado. Vuelve a completar el formulario de 'He olvidado mi contraseña'.");
            } else {
                setError("Error al actualizar la contraseña: " + updateError.message);
            }
        } else {
            setMessage("Tu contraseña se ha actualizado correctamente. Redirigiendo al login...");
            setTimeout(() => {
                router.push("/login?message=Tu contraseña se ha cambiado correctamente. Usa tu nueva contraseña para acceder.");
            }, 3000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    <div className="mb-4">
                        <Link href="/">
                            <Image src="/ruralpop-logo.png" alt="Ruralpop" width={160} height={40} className="object-contain" priority />
                        </Link>
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        Nueva Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                        Introduce tu nueva contraseña a continuación.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm p-3 rounded-md border border-green-200 dark:border-green-800 text-center">
                        {message}
                    </div>
                )}

                {!message && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password_confirm" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                    Repite la nueva contraseña
                                </label>
                                <div className="relative">
                                    <PasswordInput
                                        id="password_confirm"
                                        name="password_confirm"
                                        autoComplete="new-password"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)] transition-all shadow-sm disabled:opacity-50"
                        >
                            {isUpdating ? "Guardando..." : "Guardar contraseña"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se usa un "use client" component para que @supabase/ssr pueda leer el hash fragment de la URL que devuelve Supabase Recovery.
 * - Al instanciar `createClient()` en el navegador, Supabase extrae el `#access_token` e inicia sesión en background.
 * - Al llamar a `supabase.auth.updateUser()`, usamos esa sesión para setear la contraseña final.
 */
