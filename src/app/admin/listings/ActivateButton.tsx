"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { activateListing } from "./actions";
import { useNotification } from "@/context/NotificationContext";

interface ActivateButtonProps {
    listingId: string;
    title: string;
}

export function ActivateButton({ listingId, title }: ActivateButtonProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = () => {
        showConfirm({
            title: "¿Publicar anuncio?",
            message: `Vas a publicar y activar el anuncio "${title}". Pasará a ser visible para todos los usuarios.`,
            type: "success",
            confirmText: "Sí, publicar",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setIsActivating(true);
                try {
                    const result = await activateListing(listingId);
                    if (!result.success) {
                        showAlert({
                            title: "Error de activación",
                            message: result.error || "No se ha podido activar el anuncio.",
                            type: "error"
                        });
                    } else {
                        showAlert({
                            title: "Anuncio publicado",
                            message: "El anuncio se ha publicado con éxito.",
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
                    setIsActivating(false);
                }
            }
        });
    };

    return (
        <button
            onClick={handleActivate}
            disabled={isActivating}
            title="Aprobar y publicar anuncio"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isActivating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <CheckCircle2 className="w-4 h-4" />
            )}
        </button>
    );
}
