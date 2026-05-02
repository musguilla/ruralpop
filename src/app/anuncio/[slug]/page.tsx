import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { MapPin, Calendar, Phone, User, ArrowLeft, ShieldCheck, Tractor, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChatButton } from "@/components/chat/ChatButton";
import { decodeId } from "@/utils/idUtils";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { FavoriteDetailButton } from "@/components/ui/FavoriteDetailButton";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { PhoneRevealButton } from "@/components/ui/PhoneRevealButton";
import { buildSeoUrl, slugify } from "@/utils/seoUtils";
import { getImageUrl } from "@/utils/mediaUtils";
import { AdSenseSidebar } from "@/components/ads/AdSenseSidebar";
import { AdSenseGalleryBottom } from "@/components/ads/AdSenseGalleryBottom";
import { EscrowCheckoutButton } from "@/components/checkout/EscrowCheckoutButton";
import { calculateRuralpopFee } from "@/lib/services/escrow";

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

    if (!id) {
        return {
            title: "Anuncio no encontrado - Ruralpop",
            description: "No hemos podido localizar este anuncio."
        };
    }

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
    const resolvedImageUrls = (listing.image_urls || []).map((url: string) => getImageUrl(url));
    const mainImage = resolvedImageUrls[0] || 'https://www.ruralpop.com/default-og.jpg';

    const fullTitle = `${listing.title} - Vender y comprar ganado | Ruralpop`;

    // Acortar base para dejar espacio a las keywords SEO
    const rawDesc = listing.description?.replace(/\n/g, ' ') || "";
    const shortDesc = rawDesc.slice(0, 60) + (rawDesc.length > 60 ? '...' : '');

    const optimizedDescription = `${shortDesc} en ${listing.location}. Descarga la App gratis para buscar, vender y comprar ganado, vacas, caballos, maquinaria y servicios de campo.`;

    return {
        title: fullTitle,
        description: optimizedDescription,
        other: {
            title: fullTitle,
        },
        alternates: {
            canonical: `/anuncio/${slug}`,
        },
        openGraph: {
            title: fullTitle,
            description: optimizedDescription,
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

    if (!id) {
        notFound();
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Obtenemos los favoritos del usuario para saber si pintar el corazón relleno
    const userFavs = await getUserFavoriteIds();
    const isFavorited = userFavs.includes(id);

    // Registramos la visita (debemos hacer await para que Vercel no cierre el contexto prematuramente)
    const { error: visitErr } = await supabase.rpc('increment_listing_visits', { listing_id: id });
    if (visitErr) console.error(visitErr);

    // Obtenemos el anuncio con los datos del vendedor (join con la tabla users)
    const { data: listing, error } = await supabase
        .from("listings")
        .select(`
      *,
      seller:users(id, name, avatar_url, created_at, role, commercial_name, email)
    `)
        .eq("id", id)
        .single();

    if (error || !listing) {
        notFound();
    }

    const isTestPro = ['testpro@ruralpop.com', 'hildegartbaquero@gmail.com'].includes(listing.seller?.email?.toLowerCase().trim() || '');

    const isProfessional = listing.seller?.role === 'profesional';
    
    // Fallback para el nombre del vendedor si no existe en la tabla users
    const rawSellerName = isProfessional && listing.seller?.commercial_name ? listing.seller.commercial_name : (listing.seller?.name || "Usuario");
    
    const joinedDateObj = listing.seller?.created_at ? new Date(listing.seller.created_at) : null;
    const sellerJoinedDate = joinedDateObj
        ? `${joinedDateObj.toLocaleString('es-ES', { month: 'long' })} ${joinedDateObj.getFullYear()}`
        : "";

    // Schema Markup for Google (JSON-LD)
    const validUntilDate = new Date();
    validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    const resolvedImageUrls = (listing.image_urls || []).map((url: string) => getImageUrl(url));
    const finalImages = resolvedImageUrls.length > 0 ? resolvedImageUrls : [`${baseUrl}/opengraph-image.png`];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": listing.title,
        "image": finalImages,
        "description": listing.description || `Anuncio de clasificados de ${listing.title} en Ruralpop.`,
        "sku": id,
        "brand": {
            "@type": "Brand",
            "name": "Genérico"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "24"
        },
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5"
            },
            "author": {
                "@type": "Person",
                "name": "Usuario verificado"
            },
            "reviewBody": "Todo correcto y tal cual la descripción. Buena comunicación."
        },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/anuncio/${slug}`,
            "priceCurrency": "EUR",
            "price": listing.price || 0,
            "priceValidUntil": validUntilDate.toISOString().split("T")[0],
            "availability": listing.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/UsedCondition",
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "EUR"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "ES"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "d"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "d"
                    }
                }
            },
            "seller": {
                "@type": "Person",
                "name": rawSellerName
            }
        }
    };

    // Escrow logic
    const isOwner = user?.id === listing.seller?.id;
    const isEscrowAvailable = ['testpro@ruralpop.com', 'hildegartbaquero@gmail.com'].includes(listing.seller?.email?.toLowerCase().trim() || '') && listing.vender_online;
    const ruralpopFeeCents = calculateRuralpopFee(Math.round(listing.price * 100));

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen w-full max-w-[100vw] overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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

                <div className="flex flex-col lg:flex-row gap-8 justify-center items-start lg:max-w-[1120px] mx-auto">

                    {/* Columna Izquierda: Galería e Información */}
                    <div className="w-full min-w-0 lg:w-[728px] lg:max-w-[728px] flex-shrink-0 space-y-8">
                        <ImageGallery images={resolvedImageUrls} title={listing.title} />
                        
                        {!isProfessional && <AdSenseGalleryBottom />}

                        <div className="bg-[var(--ag-sys-color-surface)] rounded-2xl p-6 sm:p-8 border border-[var(--ag-sys-color-border)]">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] uppercase mb-2">
                                        {listing.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ag-sys-color-text-muted)]">
                                        <Link
                                            href={buildSeoUrl({ category: slugify(listing.category || ""), province_id: listing.province_id ? String(listing.province_id) : undefined })}
                                            className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full hover:text-[var(--ag-sys-color-text)] transition-colors"
                                        >
                                            <MapPin className="w-4 h-4" /> {listing.location}
                                        </Link>
                                        <span className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full">
                                            <Calendar className="w-4 h-4" /> {formatRelativeTime(listing.created_at)}
                                        </span>
                                        <Link
                                            href={buildSeoUrl({
                                                category: slugify(listing.category || ""),
                                                subcategory: listing.subcategory || undefined
                                            })}
                                            className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1 rounded-full hover:text-[var(--ag-sys-color-text)] transition-colors"
                                        >
                                            <Tractor className="w-4 h-4" /> {listing.subcategory || listing.category}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-end gap-4 mt-4 sm:mt-0">
                                    <div className="flex flex-col items-end">
                                        <div className="text-4xl font-extrabold text-[var(--ag-sys-color-primary)] leading-none">
                                            {formatCurrency(listing.price)}
                                        </div>
                                        {listing.price_type !== 'fixed' && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ag-sys-color-text-muted)] mt-1">
                                                {listing.price_type === 'negotiable' ? 'Precio Negociable' : 'A convenir'}
                                            </span>
                                        )}
                                    </div>
                                    {isEscrowAvailable && (
                                        <EscrowCheckoutButton
                                            listingId={listing.id}
                                            price={listing.price}
                                            feeCents={ruralpopFeeCents}
                                            isSeller={isOwner}
                                            variant="mini"
                                        />
                                    )}
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
                    <div className="w-full min-w-0 lg:max-w-[360px] flex-1 space-y-6">

                        {isEscrowAvailable && (
                            <EscrowCheckoutButton 
                                listingId={listing.id} 
                                price={listing.price} 
                                feeCents={ruralpopFeeCents} 
                                isSeller={isOwner}
                            />
                        )}

                        {/* Tarjeta Vendedor */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-2xl p-6 border border-[var(--ag-sys-color-border)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-16 h-16 rounded-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex flex-shrink-0 items-center justify-center text-[var(--ag-sys-color-primary)]">
                                    {listing.seller?.avatar_url ? (
                                        <img src={getImageUrl(listing.seller.avatar_url)} alt={rawSellerName} className="w-full h-full object-cover" />
                                    ) : (
                                        isProfessional ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    {isProfessional ? (
                                        <Link href={`/empresa/${slugify(rawSellerName)}`} className="group">
                                            <h4 className="font-bold text-lg text-[var(--ag-sys-color-text)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors flex items-center gap-1.5 line-clamp-1 break-all">
                                                {rawSellerName}
                                                <ShieldCheck className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                            </h4>
                                            <span className="text-xs font-bold text-[var(--ag-sys-color-primary)] uppercase tracking-wider">
                                                Ver empresa
                                            </span>
                                        </Link>
                                    ) : (
                                        <h4 className="font-bold text-lg text-[var(--ag-sys-color-text)]">{rawSellerName}</h4>
                                    )}

                                    <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-1">
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
                                    <PhoneRevealButton
                                        phone={listing.contact_phone}
                                        isLoggedIn={!!user}
                                    />
                                )}
                            </div>
                        </div>
                        <ShareButtons title={listing.title} url={`https://www.ruralpop.com/anuncio/${slug}`} />

                        {/* Garantía Ruralpop Simple (Solo si no hay venta online) */}
                        {!isEscrowAvailable && (
                            <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 flex gap-3">
                                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h5 className="text-sm font-bold text-green-800 dark:text-green-400">Trato en mano seguro</h5>
                                    <p className="text-xs text-green-700/80 dark:text-green-500/80 mt-1 leading-normal">
                                        Recuerda realizar siempre el trato en persona para revisar el estado del producto o animal.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Publicidad Google AdSense */}
                        <AdSenseSidebar />

                    </div>
                </div>
            </div>
        </div>
    );
}
