"use client";

import React, { useState } from "react";
import { Eye, Trash2, CheckCircle, Loader2, Sparkles } from "lucide-react";
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
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--ag-sys-color-border)]">
            <SoldPriceModal
                isOpen={showSoldModal}
                onClose={() => setShowSoldModal(false)}
                onConfirm={async (price) => executeToggleStatus(price)}
            />

            <div className="flex gap-2 w-full sm:w-auto">
                <Link
                    href={`/anuncio/anuncio-${encodeId(listingId)}`}
                    className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2.5 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] font-semibold rounded-xl hover:bg-[var(--ag-sys-color-border)] transition-all text-sm"
                >
                    <Eye className="w-4 h-4" />
                    Ver
                </Link>

                <button
                    onClick={handleToggleStatusClick}
                    disabled={isPending}
                    className={`flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all text-sm disabled:opacity-50 ${status === 'active'
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                        : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {status === 'active' ? 'Marcar Vendido' : 'Reactivar'}
                </button>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-red-500 font-bold hover:underline transition-all text-sm disabled:opacity-50"
                >
                    Eliminar
                </button>

                <Link
                    href={`/dashboard/edit/${encodeId(listingId)}`}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-sm flex-1 sm:flex-none"
                >
                    Modificar anuncio
                </Link>
            </div>

            {/* Feature Flag for Destacar Anuncio */}
            {status === 'active' && process.env.NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS === 'true' && (
                <div className="w-full mt-4 flex justify-center">
                    <Link
                        href={`/dashboard/destacar/${encodeId(listingId)}`}
                        className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-500/20 transform hover:-translate-y-0.5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <Sparkles className="w-5 h-5 animate-pulse relative z-10 text-yellow-200" />
                        <span className="relative z-10">Destacar anuncio</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
