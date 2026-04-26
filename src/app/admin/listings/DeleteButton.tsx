"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { deleteListing } from "./actions";
import { useNotification } from "@/context/NotificationContext";

interface DeleteButtonProps {
    listingId: string;
    title: string;
    iconOnly?: boolean;
}

export function DeleteButton({ listingId, title, iconOnly }: DeleteButtonProps) {
    const { showAlert, showConfirm } = useNotification();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        showConfirm({
            title: "¿Borrar permanentemente?",
            message: `Vas a eliminar el anuncio "${title}". Esta acción es irreversible y borrará todas las imágenes del servidor.`,
            type: "error",
            confirmText: "Sí, borrar permanentemente",
            cancelText: "No, cancelar",
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const result = await deleteListing(listingId);
                    if (!result.success) {
                        showAlert({
                            title: "Error de moderación",
                            message: result.error || "No se ha podido borrar el anuncio.",
                            type: "error"
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
                    setIsDeleting(false);
                }
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Borrar anuncio"
            className={`flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                iconOnly 
                ? "w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 border border-red-100" 
                : "gap-2 px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20"
            }`}
        >
            {isDeleting ? (
                <Loader2 className={`${iconOnly ? "w-4 h-4" : "w-3.5 h-3.5"} animate-spin`} />
            ) : (
                <XCircle className={iconOnly ? "w-4 h-4" : "w-3.5 h-3.5"} />
            )}
            {!iconOnly && (isDeleting ? "Borrando..." : "Borrar")}
        </button>
    );
}
