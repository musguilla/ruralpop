"use client";

import { useState } from "react";
import { handleConfirmReception } from "@/app/dashboard/compras/actions";
import { CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface ConfirmReceptionButtonProps {
    orderId: string;
}

export function ConfirmReceptionButton({ orderId }: ConfirmReceptionButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const executeConfirm = async () => {
        setShowModal(false);
        setLoading(true);
        setError(null);
        try {
            const res = await handleConfirmReception(orderId);
            if (!res.success) {
                setError(res.error || "Ocurrió un error.");
                setLoading(false);
            } else {
                router.refresh();
                // We don't set loading to false here because the page is about to refresh
                // and keeping it true prevents double clicks.
            }
        } catch (err: any) {
            setError(err.message || "Error de conexión.");
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-2 w-full md:w-auto">
                {error && <span className="text-xs text-red-600">{error}</span>}
                <button
                    onClick={() => setShowModal(true)}
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

            {/* Custom Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--ag-sys-color-background)] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--ag-sys-color-border)]">
                        <div className="p-6 relative">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-2 leading-tight">
                                ¿Has recibido el producto correctamente?
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] text-sm mb-6">
                                Al confirmar esta acción, liberaremos el pago de forma segura al vendedor. Esta acción es definitiva y no se puede deshacer.
                            </p>
                            <div className="flex flex-col gap-2 mt-2">
                                <button
                                    onClick={executeConfirm}
                                    className="px-5 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all w-full shadow-md flex items-center justify-center gap-2"
                                >
                                    Sí, confirmar recepción
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-3 rounded-xl font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] bg-transparent hover:bg-[var(--ag-sys-color-surface)] transition-colors w-full"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
