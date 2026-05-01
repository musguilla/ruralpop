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
}

export function EscrowCheckoutButton({ listingId, price, feeCents, isSeller }: EscrowCheckoutButtonProps) {
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

    return (
        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-green-900 dark:text-green-300 text-lg">
                        Compra segura con Ruralpop
                    </h3>
                    <p className="text-sm text-green-700/80 dark:text-green-500/80 mt-1">
                        Tu dinero queda protegido hasta que confirmes que has recibido el producto correctamente.
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-4 bg-white dark:bg-black/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="flex justify-between text-sm">
                    <span className="text-[var(--ag-sys-color-text-muted)]">Precio del producto:</span>
                    <span className="font-medium text-[var(--ag-sys-color-text)]">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[var(--ag-sys-color-text-muted)]">Protección Ruralpop:</span>
                    <span className="font-medium text-[var(--ag-sys-color-text)]">{formatCurrency(feeCents / 100)}</span>
                </div>
                <div className="pt-2 border-t border-green-100 dark:border-green-900/30 flex justify-between">
                    <span className="font-bold text-[var(--ag-sys-color-text)]">Total a pagar:</span>
                    <span className="font-extrabold text-[var(--ag-sys-color-primary)] text-lg">{formatCurrency(totalCents / 100)}</span>
                </div>
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
                    "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                    loading 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-on-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] active:scale-[0.98] shadow-md hover:shadow-lg"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    "Comprar con pago seguro"
                )}
            </button>
        </div>
    );
}
