"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { deleteListing } from "./actions";

interface DeleteButtonProps {
    listingId: string;
    title: string;
}

export function DeleteButton({ listingId, title }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres borrar permanentemente el anuncio "${title}"? Se eliminarán todas las imágenes asociadas.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteListing(listingId);
            if (!result.success) {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error al intentar borrar el anuncio.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <XCircle className="w-3.5 h-3.5" />
            )}
            {isDeleting ? "Borrando..." : "Borrar"}
        </button>
    );
}
