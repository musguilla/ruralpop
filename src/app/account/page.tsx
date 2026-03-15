import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, KeyRound, ArrowLeft, Building2, FileText, MapPin, Globe } from "lucide-react";
import { EditableField } from "@/components/account/EditableField";
import { EditableLocation } from "@/components/account/EditableLocation";
import { AvatarUpload } from "@/components/account/AvatarUpload";

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
    const avatarUrl = user_metadata?.avatar_url || "";

    const { data: publicUser } = await supabase
        .from('users')
        .select(`
            province_id, municipality_id, role,
            commercial_name, company_description, company_address, company_zip, company_country
        `)
        .eq('id', user.id)
        .single();

    // Fetch provinces to feed the first selector
    const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

    const initialProvinces = provinces || [];

    const initialProvinceId = publicUser?.province_id ? Number(publicUser.province_id) : "";
    const initialMunicipalityId = publicUser?.municipality_id ? Number(publicUser.municipality_id) : "";

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

                <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
                    <AvatarUpload initialAvatarUrl={avatarUrl} />

                    <div className="p-8 border-b border-[var(--ag-sys-color-border)]">
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6">Datos Personales</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
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

                            <EditableLocation
                                initialProvinceId={initialProvinceId}
                                initialMunicipalityId={initialMunicipalityId}
                                initialProvinces={initialProvinces}
                            />
                        </dl>
                    </div>

                    {publicUser?.role === 'profesional' && (
                        <div className="p-8 border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-primary)]/5">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                                <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Datos de la Empresa</h2>
                            </div>
                            <p className="text-sm text-[var(--ag-sys-color-text-muted)] mb-8">
                                Esta información será pública y aparecerá en el perfil de tu empresa y en tus anuncios.
                            </p>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
                                <EditableField
                                    field="commercial_name"
                                    label="Nombre Comercial"
                                    icon={<Building2 className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                    initialValue={publicUser.commercial_name || ""}
                                    placeholder="Ej: Tractores Pérez"
                                />

                                <EditableField
                                    field="company_country"
                                    label="País"
                                    icon={<Globe className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                    initialValue={publicUser.company_country || ""}
                                    placeholder="Ej: España"
                                />

                                <EditableField
                                    field="company_address"
                                    label="Dirección de la empresa"
                                    icon={<MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                    initialValue={publicUser.company_address || ""}
                                    placeholder="Ej: Polígono Industrial Sur, Nave 4"
                                />

                                <EditableField
                                    field="company_zip"
                                    label="Código Postal"
                                    icon={<MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                    initialValue={publicUser.company_zip || ""}
                                    placeholder="Ej: 28001"
                                />
                                
                                <div className="md:col-span-2">
                                    <EditableField
                                        field="company_description"
                                        label="Descripción de la empresa"
                                        icon={<FileText className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />}
                                        initialValue={publicUser.company_description || ""}
                                        placeholder="Describe tu negocio, años de experiencia, especialidades..."
                                        type="text" // Ideally this would use a textarea, but we map to EditableField for now
                                    />
                                </div>
                            </dl>
                        </div>
                    )}

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
