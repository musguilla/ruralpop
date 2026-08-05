"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Loader2, ArrowUpCircle, Sparkles, Crown, XCircle } from "lucide-react";
import { setFeaturedListing, bumpListing } from "./actions";
import { useNotification } from "@/context/NotificationContext";

interface FeatureButtonProps {
    listingId: string;
    title: string;
    isFeatured?: boolean;
}

export function FeatureButton({ listingId, title, isFeatured }: FeatureButtonProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (type: "bump" | 7 | 20 | 0) => {
        setIsOpen(false);

        let confirmTitle = "";
        let confirmMessage = "";
        let confirmType: "info" | "success" | "error" = "info";

        if (type === "bump") {
            confirmTitle = "¿Subir arriba el anuncio?";
            confirmMessage = `Vas a actualizar la fecha de "${title}" a la hora actual. Aparecerá de nuevo en la primera posición de las búsquedas.`;
        } else if (type === 7) {
            confirmTitle = "¿Destacar anuncio por 7 días?";
            confirmMessage = `Vas a marcar "${title}" como destacado durante 7 días.`;
            confirmType = "success";
        } else if (type === 20) {
            confirmTitle = "¿Destacar anuncio por 20 días?";
            confirmMessage = `Vas a marcar "${title}" como destacado durante 20 días.`;
            confirmType = "success";
        } else if (type === 0) {
            confirmTitle = "¿Quitar destacado?";
            confirmMessage = `El anuncio "${title}" dejará de ser destacado y volverá al estado normal.`;
            confirmType = "error";
        }

        showConfirm({
            title: confirmTitle,
            message: confirmMessage,
            type: confirmType,
            confirmText: "Confirmar",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    let result;
                    if (type === "bump") {
                        result = await bumpListing(listingId);
                    } else {
                        result = await setFeaturedListing(listingId, type);
                    }

                    if (!result.success) {
                        showAlert({
                            title: "Error en la acción",
                            message: result.error || "No se pudo completar la acción.",
                            type: "error"
                        });
                    } else {
                        const msgMap = {
                            bump: "Anuncio subido al 1er puesto con éxito.",
                            7: "Anuncio destacado durante 7 días.",
                            20: "Anuncio destacado durante 20 días.",
                            0: "Destacado eliminado del anuncio."
                        };
                        showAlert({
                            title: "Acción completada",
                            message: msgMap[type],
                            type: "success"
                        });
                    }
                } catch (error) {
                    console.error(error);
                    showAlert({
                        title: "Error de conexión",
                        message: "Hubo un fallo al intentar contactar con el servidor.",
                        type: "error"
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                title={isFeatured ? "Opciones de destacado (Anuncio activo)" : "Opciones de destacado y posicionamiento"}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFeatured 
                        ? "bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-300 shadow-sm" 
                        : "bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-500 border border-gray-200"
                }`}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Promoción de Anuncio</p>
                    </div>

                    <button
                        onClick={() => handleAction("bump")}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                    >
                        <ArrowUpCircle className="w-4 h-4 text-blue-500" />
                        <div>
                            <p className="font-bold leading-none">Subir arriba (Bump)</p>
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Posiciona de 1º en búsquedas</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction(7)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2.5 transition-colors"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <div>
                            <p className="font-bold leading-none">Destacar 7 días</p>
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Insignia ⭐ 7 días</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction(20)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2.5 transition-colors"
                    >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <div>
                            <p className="font-bold leading-none">Destacar 20 días</p>
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Insignia ⭐ 20 días</p>
                        </div>
                    </button>

                    {isFeatured && (
                        <>
                            <div className="my-1 border-t border-gray-100" />
                            <button
                                onClick={() => handleAction(0)}
                                className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-red-500" />
                                <div>
                                    <p className="font-bold leading-none">Quitar destacado</p>
                                    <p className="text-[10px] text-red-400 font-normal mt-0.5">Volver a estado normal</p>
                                </div>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
