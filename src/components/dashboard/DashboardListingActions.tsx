"use client";

import React, { useState } from "react";
import { Eye, CheckCircle, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { deleteListing, toggleListingStatus } from "@/app/dashboard/actions";
import { useNotification } from "@/context/NotificationContext";
import { SoldPriceModal } from "@/components/dashboard/SoldPriceModal";
import { encodeId } from "@/utils/idUtils";

import { Zap, Crown, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardListingActionsProps {
    listingId: string;
    status: string;
    isProfesional?: boolean;
    availableFeatured?: number;
    availableBumps?: number;
}

export function DashboardListingActions({ 
    listingId, 
    status, 
    isProfesional = false, 
    availableFeatured = 0, 
    availableBumps = 0 
}: DashboardListingActionsProps) {
    const router = useRouter();
    const { showAlert, showConfirm } = useNotification();
    const [isPending, setIsPending] = useState(false);
    const [showSoldModal, setShowSoldModal] = useState(false);
    const [isProDropdownOpen, setIsProDropdownOpen] = useState(false);

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

    const handleProAction = async (type: 'highlight' | 'bump') => {
        setIsPending(true);
        setIsProDropdownOpen(false);
        try {
            const res = await fetch("/api/activate-professional-feature", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, type }),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Error al activar la funcionalidad.");
            }

            showAlert({
                title: "¡Éxito!",
                message: type === 'highlight' ? "Anuncio destacado 20 días." : "Anuncio subido a primera posición.",
                type: "success"
            });
            
            router.refresh();
        } catch (error) {
            console.error("Error activating pro feature:", error);
            showAlert({
                title: "Error",
                message: error instanceof Error ? error.message : "Error al procesar la solicitud.",
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
                    className="flex items-center justify-center px-5 py-2.5 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-extrabold rounded-xl hover:bg-[var(--ag-sys-color-primary)]/20 transition-all text-sm ml-0 sm:ml-2 border border-transparent"
                >
                    Modificar anuncio
                </Link>
            </div>

            {/* Destacar anuncio / Professional Area */}
            {status === 'active' && (
                <div className="w-full xl:w-auto relative">
                    {isProfesional ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProDropdownOpen(!isProDropdownOpen)}
                                disabled={isPending}
                                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[var(--ag-sys-color-primary)] text-white font-extrabold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all text-sm shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Destacar o Impulsar</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProDropdownOpen && (
                                <div className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-[var(--ag-sys-color-border)] overflow-hidden z-[40] animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Opciones Pro</span>
                                        <button onClick={() => setIsProDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => handleProAction('bump')}
                                            disabled={availableBumps <= 0 || isPending}
                                            className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
                                        >
                                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex-shrink-0">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">Impulsar (Subir arriba)</div>
                                                <div className="text-[10px] font-bold text-blue-500 uppercase">{availableBumps} disponibles</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleProAction('highlight')}
                                            disabled={availableFeatured <= 0 || isPending}
                                            className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
                                        >
                                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 flex-shrink-0">
                                                <Crown className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">Destacar 20 días</div>
                                                <div className="text-[10px] font-bold text-amber-500 uppercase">{availableFeatured} disponibles</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        process.env.NEXT_PUBLIC_ENABLE_HIGHLIGHT_ADS === 'true' && (
                            <Link
                                href={`/dashboard/destacar/${encodeId(listingId)}`}
                                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[var(--ag-sys-color-primary)] text-white font-extrabold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all text-sm shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
                            >
                                <Sparkles className="w-5 h-5 animate-pulse text-white" />
                                <span className="group-hover:scale-105 transition-transform">Destacar anuncio</span>
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
