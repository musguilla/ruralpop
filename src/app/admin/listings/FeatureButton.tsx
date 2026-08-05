"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { setFeaturedListing } from "./actions";
import { useNotification } from "@/context/NotificationContext";

interface FeatureButtonProps {
    listingId: string;
    title: string;
    isFeatured?: boolean;
}

export function FeatureButton({ listingId, title, isFeatured }: FeatureButtonProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleFeature = () => {
        showConfirm({
            title: "¿Destacar anuncio por 20 días?",
            message: `Vas a marcar el anuncio "${title}" como destacado durante 20 días. Aparecerá en los primeros puestos y en la sección de Destacados.`,
            type: "info",
            confirmText: "Sí, destacar 20 días",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    const result = await setFeaturedListing(listingId, 20);
                    if (!result.success) {
                        showAlert({
                            title: "Error al destacar",
                            message: result.error || "No se pudo destacar el anuncio.",
                            type: "error"
                        });
                    } else {
                        showAlert({
                            title: "Anuncio Destacado",
                            message: "El anuncio se ha destacado con éxito por 20 días.",
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
        <button
            onClick={handleFeature}
            disabled={isLoading}
            title={isFeatured ? "Anuncio destacado (Click para renvoar 20 días)" : "Destacar anuncio 20 días"}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isFeatured 
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200" 
                    : "bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-500 border border-gray-200"
            }`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
            )}
        </button>
    );
}
