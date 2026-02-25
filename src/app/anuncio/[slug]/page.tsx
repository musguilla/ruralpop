import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { MapPin, Calendar, Phone, User, ArrowLeft, ShieldCheck, Tractor } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChatButton } from "@/components/chat/ChatButton";
import { decodeId } from "@/utils/idUtils";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { FavoriteDetailButton } from "@/components/ui/FavoriteDetailButton";

import { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;

    // The slug format is [title]-[shortId]
    const slugParts = slug.split('-');
    const shortId = slugParts.pop() || '';
    const id = decodeId(shortId);

    // Evitamos cookies() aquí usando instancia plana para fetching estático
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: listing } = await supabase
        .from("listings")
        .select("title, description, price, image_urls, location, category")
        .eq("id", id)
        .single();

    if (!listing) {
        return {
            title: "Anuncio no encontrado - Ruralpop",
            description: "No hemos podido localizar este anuncio."
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const mainImage = listing.image_urls?.[0] || 'https://www.ruralpop.com/default-og.jpg';
    // Formatear precio para el título (e.g. "Vendo Tractor - 12.000€")
    const priceText = listing.price ? `${new Intl.NumberFormat('es-ES').format(listing.price)}€` : '';
    const fullTitle = `${listing.title} ${priceText ? `por ${priceText} ` : ''}| Ruralpop`;

    // Acortar descripción para SEO (160 caracteres típicos)
    const shortDesc = listing.description?.slice(0, 150) + (listing.description?.length > 150 ? '...' : '');

    return {
        title: fullTitle,
        description: `${shortDesc} - En ${listing.location} (${listing.category}).`,
        openGraph: {
            title: fullTitle,
            description: shortDesc,
            url: `https://www.ruralpop.com/anuncio/${slug}`,
            siteName: 'Ruralpop',
            images: [
                {
                    url: mainImage,
                    width: 1200,
                    height: 630,
                    alt: listing.title,
                },
                ...previousImages,
            ],
            locale: 'es_ES',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: shortDesc,
            images: [mainImage],
        },
    };
}

export default async function ListingDetailPage(props: Props) {
    const { slug } = await props.params;

    // The slug format is [title]-[shortId]
    const slugParts = slug.split('-');
    const shortId = slugParts.pop() || '';
    const id = decodeId(shortId);

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Obtenemos los favoritos del usuario para saber si pintar el corazón relleno
    const userFavs = await getUserFavoriteIds();
    const isFavorited = userFavs.includes(id);

    // Obtenemos el anuncio con los datos del vendedor (join con la tabla users)
    const { data: listing, error } = await supabase
        .from("listings")
        .select(`
      *,
      seller:users(id, name, avatar_url, created_at)
    `)
        .eq("id", id)
        .single();

    if (error || !listing) {
        notFound();
    }

    // Fallback para el nombre del vendedor si no existe en la tabla users
    const sellerName = listing.seller?.name || "Usuario de Ruralpop";
    const sellerJoinedDate = listing.seller?.created_at ? new Date(listing.seller.created_at).getFullYear() : "";

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen">
            <div className="container mx-auto px-4 py-8">

                {/* Volver y Migas de pan */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al listado
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Columna Izquierda: Galería e Información */}
                    <div className="lg:col-span-8 space-y-8">
                        <ImageGallery images={listing.image_urls} title={listing.title} />

                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--ag-sys-color-border)] shadow-sm">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">
                                        {listing.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ag-sys-color-text-muted)]">
                                        <span className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full">
                                            <MapPin className="w-4 h-4" /> {listing.location}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full">
                                            <Calendar className="w-4 h-4" /> {formatRelativeTime(listing.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full">
                                            <Tractor className="w-4 h-4" /> {listing.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-extrabold text-[var(--ag-sys-color-primary)] mb-1">
                                        {formatCurrency(listing.price)}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ag-sys-color-text-muted)]">
                                        {listing.price_type === 'negotiable' ? 'Precio Negociable' :
                                            listing.price_type === 'exchange' ? 'A convenir' : 'Precio Fijo'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--ag-sys-color-border)] pt-6">
                                <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-4">Descripción</h3>
                                <div className="text-[var(--ag-sys-color-text)] whitespace-pre-wrap leading-relaxed">
                                    {listing.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Vendedor y Acciones */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Tarjeta Vendedor */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 border border-[var(--ag-sys-color-border)] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-16 h-16 rounded-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex items-center justify-center text-[var(--ag-sys-color-primary)]">
                                    {listing.seller?.avatar_url ? (
                                        <Image src={listing.seller.avatar_url} alt={sellerName} fill className="object-cover" sizes="64px" />
                                    ) : (
                                        <User className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-[var(--ag-sys-color-text)]">{sellerName}</h4>
                                    <p className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                        En Ruralpop desde {sellerJoinedDate || 'recientemente'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <FavoriteDetailButton
                                    listingId={listing.id}
                                    initialIsFavorited={isFavorited}
                                />

                                <ChatButton
                                    listingId={listing.id}
                                    isLoggedIn={!!user}
                                />

                                {listing.contact_phone && (
                                    <a
                                        href={`tel:${listing.contact_phone}`}
                                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-border)] transition-all active:scale-95"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Llamar {listing.contact_phone}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Garantía Ruralpop Simple */}
                        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 flex gap-3">
                            <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div>
                                <h5 className="text-sm font-bold text-green-800 dark:text-green-400">Trato en mano seguro</h5>
                                <p className="text-xs text-green-700/80 dark:text-green-500/80 mt-1 leading-normal">
                                    Recuerda realizar siempre el trato en persona para revisar el estado del producto o animal.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
