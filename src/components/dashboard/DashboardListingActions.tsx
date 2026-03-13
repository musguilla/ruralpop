"use client";

import React, { useState } from "react";
import { Eye, CheckCircle, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { deleteListing, toggleListingStatus } from "@/app/dashboard/actions";
import { useNotification } from "@/context/NotificationContext";
import { SoldPriceModal } from "@/components/dashboard/SoldPriceModal";
import { encodeId } from "@/utils/idUtils";

interface DashboardListingActionsProps {
    listingId: string;
    status: string;
}

export function DashboardListingActions({ listingId, status }: DashboardListingActionsProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isPending, setIsPending] = useState(false);
    const [showSoldModal, setShowSoldModal] = useState(false);

    const handleDelete = () => {
        showConfirm({
            title: "¿Eliminar anuncio?",
            message: "Esta acción no se puede deshacer y el anuncio desaparecerá por completo de Ruralpop.",
            type: "warning",
            confirmText: "Sí, eliminar",
            cancelText: "No, mantener",
            onConfirm: async () => {
                setIsPending(true);
                try {
                    await deleteListing(listingId);
                } catch (err) {
                    showAlert({
                        title: "Error",
                        message: "No se ha podido eliminar el anuncio en este momento.",
                        type: "error"
                    });
                    setIsPending(false);
                }
            }
        });
    };

    const handleToggleStatusClick = () => {
        if (status === 'active') {
            setShowSoldModal(true);
        } else {
            // Si ya está vendido, reactivarlo sin pedir precio
            executeToggleStatus(null);
        }
    };

    const executeToggleStatus = async (soldPrice: number | null) => {
        setIsPending(true);
        try {
            await toggleListingStatus(listingId, status, soldPrice);
        } catch (err) {
            showAlert({
                title: "Error",
                message: "No se ha podido actualizar el estado del anuncio.",
                type: "error"
            });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-6 pt-6 border-t border-[var(--ag-sys-color-border)]">
            <SoldPriceModal
                isOpen={showSoldModal}
                onClose={() => setShowSoldModal(false)}
                onConfirm={async (price) => executeToggleStatus(price)}
            />

            <div className="flex flex-wrap items-center gap-2">
                {/* Ver */}
                <Link
                    href={`/anuncio/anuncio-${encodeId(listingId)}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-[var(--ag-sys-color-text)] font-extrabold rounded-xl hover:bg-gray-100 transition-all text-sm border border-transparent"
                >
                    <Eye className="w-4 h-4" />
                    Ver
                </Link>

                {/* Marcar Vendido */}
                <button
                    onClick={handleToggleStatusClick}
                    disabled={isPending}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 font-extrabold rounded-xl transition-all text-sm disabled:opacity-50 border border-transparent ${status === 'active'
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                        : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {status === 'active' ? 'Marcar Vendido' : 'Reactivar'}
                </button>

                {/* Eliminar (X) */}
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center justify-center w-[40px] h-[40px] bg-gray-50 text-gray-400 font-extrabold hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 border border-transparent"
                    title="Eliminar anuncio"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Modificar anuncio */}
                <Link
                    href={`/dashboard/edit/${encodeId(listingId)}`}
                    className="flex items-center justify-center px-5 py-2.5 bg-[var(--ag-sys-color-primary)] text-white font-extrabold rounded-xl hover:opacity-90 transition-opacity text-sm ml-0 sm:ml-2 border border-transparent"
                >
                    Modificar anuncio
                </Link>
            </div>

            {/* Destacar anuncio */}
            {status === 'active' && process.env.NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS === 'true' && (
                <div className="w-full xl:w-auto flex justify-start xl:justify-end">
                    <svg width="0" height="0" className="absolute">
                        <linearGradient id="cta-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop stopColor="#34d399" offset="0%" />
                            <stop stopColor="#059669" offset="100%" />
                        </linearGradient>
                    </svg>
                    <Link
                        href={`/dashboard/destacar/${encodeId(listingId)}`}
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white border border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] font-extrabold rounded-xl hover:bg-[var(--ag-sys-color-primary)]/10 transition-colors text-sm shadow-sm"
                    >
                        <Sparkles 
                            className="w-5 h-5 animate-pulse" 
                            style={{ stroke: "url(#cta-green-gradient)", filter: "drop-shadow(0 0 2px rgba(16,185,129,0.3))" }} 
                        />
                        <span className="group-hover:scale-105 transition-transform">Destacar anuncio</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
