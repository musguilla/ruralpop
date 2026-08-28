import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { decodeId } from "@/utils/idUtils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FeaturedCheckoutFlow } from "@/components/dashboard/FeaturedCheckoutFlow";
import Image from "next/image";
import { formatCurrency } from "@/utils/format";

import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DestacarAnuncioPage(props: Props) {
    const headersList = await headers();
    const locale = headersList.get('x-locale') || 'es';
    const isPt = locale === 'pt';

    // Feature flag protection
    if (process.env.NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS !== 'true') {
        redirect("/dashboard");
    }

    const { id: encodedId } = await props.params;
    const searchParams = await props.searchParams;
    const isNewlyPublished = searchParams?.published === "true";
    
    const listingId = decodeId(encodedId);

    if (!listingId) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Comprobar si el usuario es un profesional
    const { data: publicUser } = await supabase
        .from("public_users")
        .select("role, available_featured, available_bumps")
        .eq("id", user.id)
        .single();

    const isProfesional = publicUser?.role === "profesional";
    const availableFeatured = publicUser?.available_featured || 0;
    const availableBumps = publicUser?.available_bumps || 0;

    const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .eq("user_id", user.id)
        .single();

    if (error || !listing) {
        notFound();
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] font-semibold mb-8 group transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {isPt ? "Voltar ao meu painel" : "Volver a mi panel"}
                </Link>

                {isNewlyPublished && (
                    <div className="mb-10 font-bold text-green-700 bg-green-50/80 border border-green-200 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm">
                        <div className="bg-green-100 p-1.5 rounded-full text-green-600 flex-shrink-0">
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-xl">{isPt ? "O seu anúncio foi publicado!" : "¡Tu anuncio ha sido publicado!"}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                            {isPt ? "Destaque o seu anúncio" : "Destaca tu anuncio"}
                        </h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg max-w-xl mx-auto md:mx-0">
                            {isPt ? "Multiplique as suas possibilidades de venda. Escolha o plano que melhor se adapta a si e faça o seu anúncio destacar-se dos restantes." : "Multiplica tus posibilidades de venta. Elige el plan que mejor se adapte a ti y haz que tu anuncio destaque por encima del resto."}
                        </p>
                    </div>

                    <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-5 border border-[var(--ag-sys-color-border)] shadow-sm flex items-center gap-4 w-full md:w-auto md:min-w-[320px]">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0 border border-[var(--ag-sys-color-border)]">
                            {listing.image_urls?.[0] ? (
                                <Image
                                    src={listing.image_urls[0]}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-2">
                                    Sin foto
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-[var(--ag-sys-color-text)] truncate">{listing.title}</h2>
                            <div className="text-base font-black text-[var(--ag-sys-color-primary)] mt-0.5">{formatCurrency(listing.price)}</div>
                            {listing.is_featured && (
                                <div className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                                    {isPt ? "Destacado!" : "¡Destacado!"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <FeaturedCheckoutFlow 
                    listingId={listing.id} 
                    isProfesional={isProfesional}
                    availableFeatured={availableFeatured}
                    availableBumps={availableBumps}
                    isNewlyPublished={isNewlyPublished}
                />

                {isNewlyPublished && (
                    <div className="mt-12 pt-8 border-t border-[var(--ag-sys-color-border)] text-center flex flex-col items-center animate-in fade-in duration-700">
                        <Link 
                            href="/" 
                            className="inline-flex py-4 px-10 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-md shadow-[var(--ag-sys-color-primary)]/20 w-full md:w-auto justify-center"
                        >
                            {isPt ? "Ver o meu anúncio publicado" : "Ver mi anuncio publicado"}
                        </Link>
                        <p className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] mt-5 flex items-center gap-2">
                            Si no deseas destacarlo ahora, puedes hacerlo más adelante desde tu panel.
                        </p>
                    </div>
                )}
                
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página protegida asegurando que el listing pertenece al usuario logueado.
 * - Usamos `FeaturedCheckoutFlow` (Client Component) para gestionar el estado de selección de plan y posteriormente el formulario de Stripe.
 * - Protegido temporalmente con `NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS`.
 */
