import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ClaimProfileFlow } from "@/components/profesionales/ClaimProfileFlow";
import { ShieldCheck, Check } from "lucide-react";

export const metadata = {
    title: "Reclama tu Perfil Profesional | Ruralpop",
    description: "Activa tu escaparate profesional y empieza a vender sin límites.",
    robots: { index: false, follow: false },
};

export default async function ClaimProfilePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const token = typeof sp.token === 'string' ? sp.token : null;

    if (!token) {
        redirect("/profesionales");
    }

    const supabase = await createClient();

    // Verify token matches a ghost profile
    const { data: company, error } = await supabase
        .from('users')
        .select('id, commercial_name, company_description, is_ghost, ghost_token')
        .eq('ghost_token', token)
        .eq('is_ghost', true)
        .eq('role', 'profesional')
        .single();

    if (error || !company) {
        redirect("/profesionales");
    }

    return (
        <main className="min-h-screen bg-[var(--ag-sys-color-background)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        Perfil pre-configurado detectado
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        Activa el perfil de <span className="text-[var(--ag-sys-color-primary)]">{company.commercial_name}</span>
                    </h1>
                    <p className="text-lg text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto">
                        Crea tu cuenta ahora para reclamar la propiedad de este escaparate profesional y todos sus anuncios asociados.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Benefits Column */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold mb-6">¿Qué consigues al activar tu plan?</h3>
                        <ul className="space-y-4">
                            {[
                                "Visibilidad inmediata para tus anuncios",
                                "Sello Profesional Verificado",
                                "Estadísticas y métricas de visitas",
                                "Impulsos de Anuncio incluidos cada mes",
                                "Recuentos de contactos por WhatsApp y Email",
                                "Gestión de stock sin límites de caducidad"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium text-sm">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action form Column */}
                    <div>
                        <ClaimProfileFlow ghostToken={token} />
                    </div>
                </div>
            </div>
        </main>
    );
}
