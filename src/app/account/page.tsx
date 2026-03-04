import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { EditableField } from "@/components/account/EditableField";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { user_metadata, email, phone } = user;
    const fullName = user_metadata?.name || "";
    const userPhone = phone || user_metadata?.phone || "";
    const userEmail = email || "";

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-3xl">
                <header className="mb-10">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver a Mi Panel
                    </Link>
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mi cuenta
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        Gestiona tu información personal y de seguridad.
                    </p>
                </header>

                <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-[var(--ag-sys-color-border)]">
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6">Datos Personales</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
                            <EditableField
                                field="name"
                                label="Nombre Completo"
                                icon={<User className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                initialValue={fullName}
                                placeholder="Tu nombre..."
                            />

                            <EditableField
                                field="phone"
                                label="Teléfono"
                                icon={<Phone className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                type="tel"
                                initialValue={userPhone}
                                placeholder="Tu teléfono..."
                            />

                            <EditableField
                                field="email"
                                label="Email"
                                icon={<Mail className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                type="email"
                                initialValue={userEmail}
                                placeholder="Tu correo electrónico..."
                            />
                        </dl>
                    </div>

                    <div className="p-8 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6">Seguridad</h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-2">
                                    <KeyRound className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                    Contraseña
                                </dt>
                                <dd className="text-lg font-bold text-[var(--ag-sys-color-text)] tracking-[0.2em]">
                                    ••••••••
                                </dd>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="inline-flex py-3 px-6 bg-white text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Cambiar contraseña
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se ha creado la página `/account` de forma que encapsule la vista de los datos de perfil de usuario.
 * - Leí los datos por el JWT del usuario de auth porque son fiables (auth.getUser()).
 * - "Contraseña" usa placeholder visual que enlaza con flow de "forgot-password", reutilizando lo que el sistema ya tiene de base.
 * - Estética Premium siguiendo variables de UI (bordes redondeados a nivel 3xl, sombras suaves, gap system adaptativo).
 */
