"use client";

import React from "react";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Cookie className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Política de Cookies</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Uso de cookies en Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página. <strong>Ruralpop</strong> utiliza cookies exclusivamente técnicas para manejar el estado de tu sesión de usuario.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Cookies Propias</h3>
                    <p>
                        Utilizamos cookies técnicas, en específico de nuestro proveedor de autenticación <strong>Supabase</strong>, estrictamente necesarias para la navegación, para garantizar que puedas iniciar sesión en nuestra web y publicar o comunicarte de forma segura.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Cookies de Terceros</h3>
                    <p>
                        Actualmente no utilizamos cookies de terceros con fines de publicidad o rastreo abusivo de patrones de comportamiento (como píxeles publicitarios invasivos).
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Desactivación o eliminación de cookies</h3>
                    <p>
                        En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web. Puedes encontrar información sobre cómo hacerlo en los ajustes de privacidad y seguridad de tu propio navegador web.
                        <em> (Aviso: limpiar las cookies cerrará su sesión iniciada en Ruralpop automáticamente).</em>
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de Cookies requerida por el footer.
 */
