"use client";

import { useState } from "react";
import { handleEscrowCheckout } from "@/app/checkout/escrowActions";
import { formatCurrency } from "@/utils/format";
import { ShieldCheck, Loader2 } from "lucide-react";
import clsx from "clsx";

interface EscrowCheckoutButtonProps {
    listingId: string;
    price: number;
    feeCents: number;
    isSeller?: boolean;
    variant?: 'default' | 'mini';
}

export function EscrowCheckoutButton({ listingId, price, feeCents, isSeller, variant = 'default' }: EscrowCheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const priceCents = Math.round(price * 100);
    const totalCents = priceCents + feeCents;

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await handleEscrowCheckout(listingId);
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                setError(res.error || "Ocurrió un error al iniciar el pago.");
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "Error de conexión.");
            setLoading(false);
        }
    };

    if (variant === 'mini') {
        return (
            <button
                onClick={handleCheckout}
                disabled={loading}
                className={clsx(
                    "flex items-center justify-center gap-2 py-2 px-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95",
                    loading && "opacity-70 cursor-not-allowed"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    "Comprar"
                )}
            </button>
        );
    }

    return (
        <>
            {/* Tarjeta de Compra */}
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 mb-4">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="text-5xl font-extrabold text-[var(--ag-sys-color-primary)] mb-2 tracking-tight">
                        {formatCurrency(price)}
                    </div>
                    <p className="text-xs font-semibold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                        Compra protegida por Protección Ruralpop
                    </p>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3">
                        <p>{error}</p>
                        {isSeller && error.includes("El vendedor aún no ha") && (
                            <a 
                                href="/dashboard/monedero" 
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-center transition-colors shadow-sm"
                            >
                                Configurar mi monedero
                            </a>
                        )}
                    </div>
                )}

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={clsx(
                        "w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                        loading 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] shadow-[var(--ag-sys-color-primary)]/20"
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        "Comprar"
                    )}
                </button>
            </div>

            {/* Tarjeta Informativa Garantía */}
            <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-2xl p-5 mb-6 flex gap-3 items-start">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-green-900 dark:text-green-300 text-sm">
                        Compra segura con Ruralpop
                    </h4>
                    <p className="text-xs text-green-700/80 dark:text-green-500/80 mt-1 leading-normal">
                        Tu dinero queda protegido hasta que confirmes que has recibido el producto correctamente.
                    </p>
                </div>
            </div>
        </>
    );
}
