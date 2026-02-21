import Link from "next/link";
import { Tractor } from "lucide-react";
import { login } from "./actions";

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const searchParams = await props.searchParams;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    <div className="bg-[var(--ag-sys-color-background)] p-3 rounded-full mb-4">
                        <Tractor className="w-8 h-8 text-[var(--ag-sys-color-primary)]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        Inicia Sesión
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                        ¿Aún no tienes cuenta?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] transition-colors"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

                {searchParams?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 text-center">
                        {searchParams.error}
                    </div>
                )}

                <form className="mt-8 space-y-6" action={login}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)] transition-all shadow-sm"
                    >
                        Entrar a Ruralpop
                    </button>
                </form>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se usa Server Actions puros asociando `action={login}` nativo del form.
 * - Los estilos estéticos premium (`rounded-xl`, focus states) provienen de los tokens CSS unificados de Antigravity.
 * - Soporte server component seguro sin hooks del cliente (`useState`) ni dependencias superfluas.
 */
