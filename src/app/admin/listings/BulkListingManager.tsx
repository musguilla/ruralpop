"use client";

import React, { useState } from "react";
import {
    Package,
    MapPin,
    Tag,
    Eye,
    UserCheck,
    Edit,
    Heart,
    Star,
    Trash2,
    Loader2
} from "lucide-react";
import Image from "next/image";
import SupabaseImage from "@/components/ui/SupabaseImage";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { encodeId } from "@/utils/idUtils";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";
import { ActivateButton } from "./ActivateButton";
import { useNotification } from "@/context/NotificationContext";
import { deleteMultipleListings } from "./actions";

interface BulkListingManagerProps {
    listings: any[];
}

export function BulkListingManager({ listings }: BulkListingManagerProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const { showAlert, showConfirm } = useNotification();

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === listings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(listings.map(l => l.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;

        showConfirm({
            title: "¿Borrar múltiples anuncios?",
            message: `Vas a eliminar ${selectedIds.size} anuncios permanentemente. Esta acción es irreversible y borrará todas sus imágenes del servidor.`,
            type: "error",
            confirmText: "Sí, borrar todos",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const result = await deleteMultipleListings(Array.from(selectedIds));
                    if (!result.success) {
                        showAlert({
                            title: "Error de borrado masivo",
                            message: result.error || "No se han podido borrar todos los anuncios.",
                            type: "error"
                        });
                    } else {
                        showAlert({
                            title: "Anuncios eliminados",
                            message: `Se han eliminado ${selectedIds.size} anuncios con éxito.`,
                            type: "success"
                        });
                        setSelectedIds(new Set());
                    }
                } catch (error) {
                    console.error(error);
                    showAlert({
                        title: "Error de conexión",
                        message: "Hubo un fallo al intentar contactar con el servidor.",
                        type: "error"
                    });
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    if (!listings || listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl">
                <Package className="w-12 h-12 text-[var(--ag-sys-color-text-muted)] mb-4 opacity-50" />
                <p className="text-[var(--ag-sys-color-text-muted)] font-medium">No se han encontrado anuncios</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="sticky top-20 z-40 flex items-center justify-between bg-white border border-blue-200 shadow-md rounded-2xl p-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {selectedIds.size}
                        </div>
                        <span className="font-bold text-gray-800">anuncios seleccionados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={isDeleting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Borrar Selección
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                <button 
                    onClick={selectAll}
                    className="flex items-center gap-2 hover:text-[var(--ag-sys-color-text)] font-medium transition-colors cursor-pointer"
                >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.size === listings.length && listings.length > 0 ? 'bg-[var(--ag-sys-color-primary)] border-[var(--ag-sys-color-primary)]' : 'border-gray-300 bg-white'}`}>
                        {selectedIds.size === listings.length && listings.length > 0 && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </div>
                    Seleccionar todos
                </button>
                <span>Mostrando {listings.length} anuncios en esta página</span>
            </div>

            <div className="flex flex-col gap-3">
                {listings.map((l: any) => {
                    const isSelected = selectedIds.has(l.id);
                    return (
                        <div
                            key={l.id}
                            className={`relative bg-[var(--ag-sys-color-surface)] rounded-2xl border ${isSelected ? 'border-[var(--ag-sys-color-primary)] ring-1 ring-[var(--ag-sys-color-primary)]' : 'border-[var(--ag-sys-color-border)]'} shadow-sm hover:shadow-md transition-all group p-3 sm:p-4`}
                        >
                            <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10">
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(l.id); }}
                                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all backdrop-blur-sm shadow-sm ${isSelected ? 'bg-[var(--ag-sys-color-primary)] border-[var(--ag-sys-color-primary)] ring-2 ring-[var(--ag-sys-color-primary)]/20 text-white' : 'bg-white/90 border-gray-300 hover:border-gray-400 text-transparent hover:text-gray-300'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pl-8 sm:pl-10">
                                {/* Image and Status */}
                                <div className="relative w-full sm:w-24 sm:h-24 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0 cursor-pointer" onClick={() => toggleSelection(l.id)}>
                                    {l.image_urls?.[0] ? (
                                        <SupabaseImage src={l.image_urls[0]} alt={l.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)] opacity-20">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md ${l.status === 'active' ? 'bg-green-500/90 text-white' :
                                        l.status === 'moderated' ? 'bg-amber-500/90 text-white' :
                                            'bg-red-500/90 text-white'
                                        }`}>
                                        {l.status}
                                    </div>
                                    {l.vender_online && (
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md bg-emerald-500/90 text-white">
                                            Online
                                        </div>
                                    )}
                                    {l.is_featured && (
                                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md bg-amber-500/90 text-white flex items-center gap-0.5 shadow-sm border border-amber-400/50">
                                            <Star className="w-2 h-2 fill-white" /> DESTACADO
                                        </div>
                                    )}
                                </div>

                                {/* Info Wrapper */}
                                <div className="flex-1 min-w-0 w-full flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleSelection(l.id)}>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="text-base font-black text-[var(--ag-sys-color-text)] line-clamp-1">{l.title}</h3>
                                            <span className="text-base font-black text-[var(--ag-sys-color-primary)]">{formatCurrency(l.price)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--ag-sys-color-text-muted)] font-bold flex-wrap">
                                            <span className="flex items-center gap-1 whitespace-nowrap"><MapPin className="w-3 h-3" /> {l.location}</span>
                                            <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full flex-shrink-0"></span>
                                            <span className="flex items-center gap-1 whitespace-nowrap"><Tag className="w-3 h-3" /> {l.category}{l.subcategory ? ` > ${l.subcategory}` : ''}</span>
                                            <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full flex-shrink-0"></span>
                                            <span className="flex items-center gap-1 text-red-500 whitespace-nowrap"><Heart className="w-3 h-3 fill-current" /> {l.favorites?.[0]?.count || 0}</span>
                                        </div>
                                    </div>

                                    {/* Seller Info & Actions */}
                                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] flex items-center justify-center text-[var(--ag-sys-color-primary)] overflow-hidden flex-shrink-0">
                                                {(l.seller as Record<string, string | null>)?.avatar_url ? <Image src={(l.seller as Record<string, string | null>).avatar_url as string} alt="" width={24} height={24} /> : <UserCheck className="w-3 h-3" />}
                                            </div>
                                            <div className="hidden md:block">
                                                <div className="flex items-center gap-1 mb-0.5 max-w-[120px]">
                                                    <p className="text-[10px] font-bold text-[var(--ag-sys-color-text)] leading-none truncate">{(l.seller as Record<string, string | null>)?.name || 'Vendedor'}</p>
                                                    {(l.seller as Record<string, string | null>)?.plan_type && (l.seller as Record<string, string | null>)?.plan_type !== 'free' && (
                                                        <span className="text-[8px] px-1 py-[1px] bg-purple-100 text-purple-700 font-black rounded uppercase tracking-wider leading-none">{(l.seller as Record<string, string | null>)?.plan_type}</span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider font-bold">{formatRelativeTime(l.created_at)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/admin/listings/edit/${encodeId(l.id)}`} title="Editar anuncio" className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-full hover:bg-blue-100 transition-all">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <Link href={`/anuncio/${l.slug || 'anuncio-' + encodeId(l.id)}`} target="_blank" title="Ver anuncio" className="flex items-center justify-center w-8 h-8 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] rounded-full hover:bg-[var(--ag-sys-color-border)] transition-all">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {l.status === 'draft' && (
                                                <ActivateButton listingId={l.id} title={l.title} />
                                            )}
                                            <DeleteButton listingId={l.id} title={l.title} sellerEmail={(l.seller as Record<string, string | null>)?.email || undefined} iconOnly={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
