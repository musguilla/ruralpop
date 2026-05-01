"use client";

import { useState } from "react";
import { handleConfirmReception } from "@/app/dashboard/compras/actions";
import { CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";

interface ConfirmReceptionButtonProps {
    orderId: string;
}

export function ConfirmReceptionButton({ orderId }: ConfirmReceptionButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!confirm("¿Estás seguro de que has recibido el producto en buen estado? Esta acción liberará el pago al vendedor y no se puede deshacer.")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await handleConfirmReception(orderId);
            if (!res.success) {
                setError(res.error || "Ocurrió un error.");
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "Error de conexión.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full md:w-auto">
            {error && <span className="text-xs text-red-600">{error}</span>}
            <button
                onClick={handleConfirm}
                disabled={loading}
                className={clsx(
                    "px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto",
                    loading 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-md hover:shadow-lg"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirmando...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirmar Recepción
                    </>
                )}
            </button>
            <span className="text-[10px] text-center text-[var(--ag-sys-color-text-muted)] mt-1 max-w-[200px] leading-tight">
                Al confirmar, liberas el pago retenido al vendedor.
            </span>
        </div>
    );
}
