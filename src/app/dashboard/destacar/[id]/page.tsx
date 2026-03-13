import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { decodeId } from "@/utils/idUtils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FeaturedCheckoutFlow } from "@/components/dashboard/FeaturedCheckoutFlow";
import Image from "next/image";
import supabaseLoader from "@/utils/supabase-image-loader";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function DestacarAnuncioPage(props: Props) {
    // Feature flag protection
    if (process.env.NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS !== 'true') {
        redirect("/dashboard");
    }

    const { id: encodedId } = await props.params;
    const listingId = decodeId(encodedId);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: listing, error } = await supabase
        .from("listings")
        .select("id, title, price, image_urls, user_id, is_featured, featured_until")
        .eq("id", listingId)
        .single();

    if (error || !listing) {
        notFound();
    }

    // Ensure the user owns this listing
    if (listing.user_id !== user.id) {
        redirect("/dashboard");
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-8 sm:py-12 w-full">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group mb-8"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver a mi panel
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        Destaca tu anuncio
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] text-lg max-w-2xl mx-auto">
                        Multiplica tus posibilidades de venta. Elige el plan que mejor se adapte a ti y haz que tu anuncio destaque por encima del resto.
                    </p>
                </div>

                <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 border border-[var(--ag-sys-color-border)] shadow-sm mb-12 flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0 border border-[var(--ag-sys-color-border)]">
                        {listing.image_urls?.[0] ? (
                            <Image
                                loader={supabaseLoader}
                                src={listing.image_urls[0]}
                                alt={listing.title}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                Sin foto
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] line-clamp-2">{listing.title}</h2>
                        <div className="text-lg font-black text-[var(--ag-sys-color-primary)] mt-1">{new Intl.NumberFormat('de-DE').format(listing.price)}€</div>
                        {listing.is_featured && (
                            <div className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                Actualmente destacado
                            </div>
                        )}
                    </div>
                </div>

                <FeaturedCheckoutFlow listingId={listing.id} />
                
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
