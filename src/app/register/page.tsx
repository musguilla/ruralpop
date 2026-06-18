import Link from "next/link";
import Image from "next/image";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { signup } from "./actions";
import { Metadata } from "next";
import { getServerTenantSlug } from "@/utils/tenant/server";

export const metadata: Metadata = {
    title: "Crea una Cuenta | Ruralpop",
    description: "Únete a Ruralpop y empieza a comprar y vender en el mercado agrícola y ganadero.",
    alternates: { canonical: "/register" }
};

export default async function RegisterPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const searchParams = await props.searchParams;
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    {!isEquipop && (
                        <div className="mb-4">
                            <Image src="/ruralpop-logo.png" alt="Ruralpop" width={160} height={40} className="object-contain" priority />
                        </div>
                    )}
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        Crea una Cuenta
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                        ¿Ya eres miembro?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] transition-colors"
                        >
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                {searchParams?.error === "user_exists" ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm p-3 rounded-md border border-blue-200 dark:border-blue-800 text-center">
                        <strong>¡Ya tienes una cuenta en nuestra red!</strong><br/>
                        Este correo electrónico ya está registrado en {isEquipop ? "Ruralpop" : "Equipop"}. Puedes usar tu contraseña habitual para{" "}
                        <Link href="/login" className="font-bold underline hover:text-[var(--ag-sys-color-primary)]">
                            Iniciar sesión
                        </Link>
                        {" "}en {isEquipop ? "Equipop" : "Ruralpop"}. Si no la recuerdas, utiliza{" "}
                        <Link href="/forgot-password" className="font-bold underline hover:text-[var(--ag-sys-color-primary)]">
                            Recordar contraseña
                        </Link>
                        .
                    </div>
                ) : searchParams?.error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 text-center">
                        {searchParams.error}
                    </div>
                ) : null}

                <form className="mt-8 space-y-6" action={signup}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                Nombre completo
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Juan Prieto"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                Correo electrónico
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
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirm" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                Repite la contraseña
                            </label>
                            <PasswordInput
                                id="password_confirm"
                                name="password_confirm"
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <SubmitButton label="Registrarme gratis" />
                </form>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se usa la metadata de Next.js (`raw_user_meta_data`) internamente pasando el 'name', para que el Trigger SQL insertará en la tabla final `public.users`.
 * - Estética simétrica con el Login.
 */
