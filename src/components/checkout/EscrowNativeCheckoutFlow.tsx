"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { handleEscrowPaymentIntentNative } from "@/app/checkout/escrowActions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { EscrowCheckoutForm } from "./EscrowCheckoutForm";
import clsx from "clsx";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface EscrowNativeCheckoutFlowProps {
    listingId: string;
    price: number;
    feeCents: number;
    shippingPrice?: number;
    isSeller?: boolean;
}

export function EscrowNativeCheckoutFlow({ listingId, price, feeCents, shippingPrice = 0, isSeller }: EscrowNativeCheckoutFlowProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    const priceCents = Math.round(price * 100);
    const shippingCents = Math.round(shippingPrice * 100);
    const totalCents = priceCents + shippingCents + feeCents;

    const handleStartCheckout = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await handleEscrowPaymentIntentNative(listingId);
            if (res.success && res.clientSecret && res.orderId) {
                setClientSecret(res.clientSecret);
                setOrderId(res.orderId);
            } else {
                setError(res.error || "Ocurrió un error al inicializar el pago seguro.");
            }
        } catch (err: any) {
            setError(err.message || "Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    if (clientSecret && orderId) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--ag-sys-color-border)]">
                    <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        Pago seguro
                    </h3>
                    <button 
                        onClick={() => { setClientSecret(null); setOrderId(null); }}
                        className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancelar
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <div className="flex justify-between text-sm mb-2 text-[var(--ag-sys-color-text-muted)]">
                        <span>Producto</span>
                        <span>{formatCurrency(price)}</span>
                    </div>
                    {shippingPrice > 0 && (
                        <div className="flex justify-between text-sm mb-2 text-[var(--ag-sys-color-text-muted)]">
                            <span>Envío</span>
                            <span>{formatCurrency(shippingPrice)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm mb-3 text-[var(--ag-sys-color-text-muted)]">
                        <span>Protección Ruralpop</span>
                        <span>{formatCurrency(feeCents / 100)}</span>
                    </div>
                    <div className="flex justify-between font-black text-lg pt-3 border-t border-gray-200 text-[var(--ag-sys-color-text)]">
                        <span>Total a pagar</span>
                        <span>{formatCurrency(totalCents / 100)}</span>
                    </div>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <EscrowCheckoutForm orderId={orderId} totalAmountCents={totalCents} />
                </Elements>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 mb-4">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="text-5xl font-extrabold text-[var(--ag-sys-color-primary)] mb-2 tracking-tight">
                        {formatCurrency(price)}
                    </div>
                    <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-1">
                        Compra protegida por protección Ruralpop
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
                    onClick={handleStartCheckout}
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
                            Iniciando pago seguro...
                        </>
                    ) : (
                        "Comprar"
                    )}
                </button>
            </div>

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
