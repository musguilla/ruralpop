import React from 'react';
import Image from 'next/image';
import { Tractor, MapPin, Tag, Clock, CheckCircle2, Heart } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import { DashboardListingActions } from './DashboardListingActions';
import { ConfirmReturnButton } from './ConfirmReturnButton';

export interface Listing {
    id: string;
    title: string;
    price: number;
    sold_price?: number;
    location: string;
    image_urls: string[];
    created_at: string;
    category: string;
    price_type: string;
    is_featured?: boolean;
    status: string;
    vender_online?: boolean;
    favorites?: Array<{ count: number }>;
    tags?: string[];
}

export interface EscrowOrder {
    id: string;
    status: string;
    seller_net_amount_cents: number;
    listings: Listing;
    buyer: {
        email: string;
    };
}

export type UnifiedItem = {
    type: 'active' | 'manual' | 'escrow';
    data: Listing | EscrowOrder;
    date: number;
};

export interface PublicUser {
    role: string;
    available_bumps: number;
    available_featured: number;
    is_ghost?: boolean;
}

type Props = {
    item: UnifiedItem;
    publicUser: PublicUser | null;
    currentTab: 'active' | 'sold' | 'reserved';
};

export function UnifiedListingCard({ item, publicUser, currentTab }: Props) {
    const isEscrow = item.type === 'escrow';
    const order = isEscrow ? (item.data as EscrowOrder) : null;
    const listing = isEscrow ? (order?.listings) : (item.data as Listing);

    // Si es un listing borrado que sigue en escrow
    if (!listing) return null;

    const imageUrl = listing.image_urls?.[0];
    const isPendingConfirmation = order && (order.status === "paid_held" || order.status === "awaiting_delivery");
    const isConfirmed = order && (order.status === "buyer_confirmed" || order.status === "paid_out");

    return (
        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row">
                {/* Thumbnail: Más compacto */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={listing.title}
                            fill
                            className={`object-cover transition-transform duration-500 ${currentTab === 'active' ? 'group-hover:scale-105' : 'grayscale opacity-80'}`}
                            sizes="(max-width: 640px) 100vw, 250px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)]">
                            <Tractor className="w-12 h-12 opacity-10" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm text-white ${
                        currentTab === 'active' ? 'bg-green-500/90' : 'bg-amber-500/90'
                    }`}>
                        {currentTab === 'active' ? 'Activo' : 'Vendido'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <div className="flex-1 flex flex-row items-center flex-wrap gap-2">
                                <h4 className="text-lg font-bold text-[var(--ag-sys-color-text)] line-clamp-2">
                                    {listing.title}
                                </h4>
                                <span className="inline-flex flex-shrink-0 items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-900/50">
                                    <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                                    {listing.favorites?.[0]?.count || 0}
                                </span>
                            </div>
                            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                                {isEscrow && order ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-amber-600">
                                            {formatCurrency(order.seller_net_amount_cents / 100)}
                                        </span>
                                        <span className="text-xs font-medium text-[var(--ag-sys-color-text-muted)] line-through">
                                            {formatCurrency(listing.price)}
                                        </span>
                                    </div>
                                ) : (currentTab === 'sold' && listing.sold_price) ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-amber-600">
                                            {formatCurrency(listing.sold_price)}
                                        </span>
                                        <span className="text-xs font-medium text-[var(--ag-sys-color-text-muted)] line-through">
                                            {formatCurrency(listing.price)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xl font-black text-[var(--ag-sys-color-primary)]">
                                        {formatCurrency(listing.price)}
                                    </span>
                                )}
                                {listing.vender_online && (
                                    <span className="inline-flex flex-shrink-0 items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Venta Online
                                    </span>
                                )}
                            </div>
                        </div>

                        {isEscrow && order && (
                            <div className="text-sm text-[var(--ag-sys-color-text-muted)] mb-3">
                                Comprador: <span className="font-medium text-[var(--ag-sys-color-text)]">{order.buyer?.email}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-[var(--ag-sys-color-text-muted)] mt-3">
                            <div className="flex items-center gap-1 bg-[var(--ag-sys-color-background)] px-2 py-1 rounded-md border border-[var(--ag-sys-color-border)]">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{listing.location}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-[var(--ag-sys-color-background)] px-2 py-1 rounded-md border border-[var(--ag-sys-color-border)]">
                                <Tag className="w-3.5 h-3.5" />
                                {listing.category}
                            </div>
                            <div className="flex items-center gap-1 bg-[var(--ag-sys-color-background)] px-2 py-1 rounded-md border border-[var(--ag-sys-color-border)]">
                                <Clock className="w-3.5 h-3.5" />
                                {formatRelativeTime(item.date ? new Date(item.date).toISOString() : listing.created_at)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--ag-sys-color-border)] flex flex-wrap items-center justify-between gap-3">
                        {currentTab === 'active' ? (
                            <DashboardListingActions 
                                listingId={listing.id} 
                                status={listing.status}
                                isProfesional={publicUser?.role === 'profesional'}
                                availableFeatured={publicUser?.available_featured || 0}
                                availableBumps={publicUser?.available_bumps || 0}
                            />
                        ) : (
                            <div className="w-full flex justify-between items-center">
                                {/* Estado Escrow */}
                                {isEscrow && order ? (
                                    <div className="flex items-center gap-2">
                                        {isPendingConfirmation ? (
                                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                Pendiente confirmación
                                            </span>
                                        ) : isConfirmed ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                                            </span>
                                        ) : order.status === "return_initiated" ? (
                                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                Devolución iniciada
                                            </span>
                                        ) : order.status === "refunded" ? (
                                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                Reembolsado
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase">
                                                {order.status.replace("_", " ")}
                                            </span>
                                        )}
                                        
                                        {order.status === "return_initiated" && (
                                            <ConfirmReturnButton orderId={order.id} />
                                        )}
                                    </div>
                                ) : (
                                    <span className="bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--ag-sys-color-border)]">
                                        Venta manual (sin protección)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Reposicionamiento de "Venta Online": Se ha trasladado desde el área del título a la columna del precio (alineación derecha)
 *   para desaturar visualmente el título y ordenar mejor los metadatos comerciales.
 * - Badge de Favoritos: Añadido al lado derecho del título para mostrar de un vistazo la atracción de usuarios del anuncio.
 *   Utiliza el token `--ag-sys-color-*` y se adapta a temas claros/oscuros.
 * - Tipo-Seguridad Estricta: Se han eliminado los tipos `any` genéricos para `UnifiedItem` y `Props`, creando las interfaces
 *   `Listing`, `EscrowOrder` y `PublicUser` para garantizar cero errores de tipado e integración en tiempo de compilación.
 * - Edge Cases Cubiertos: Controlamos mediante encadenamiento opcional (`listing.favorites?.[0]?.count`) la inexistencia de datos
 *   de favoritos pre-cargados de Supabase para evitar errores de renderizado.
 */

