"use client";

import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface EscrowCheckoutFormProps {
    orderId: string;
    totalAmountCents: number;
}

export function EscrowCheckoutForm({ orderId, totalAmountCents }: EscrowCheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirects to success page after payment
                return_url: `${window.location.origin}/checkout/escrow/success?session_id=native_${orderId}`,
            },
        });

        if (error) {
            setErrorMessage(error.message ?? "Ocurrió un error inesperado al procesar el pago.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement 
                id="payment-element" 
                options={{ 
                    layout: "tabs",
                    wallets: {
                        applePay: 'never',
                        googlePay: 'never'
                    }
                }} 
            />
            
            {errorMessage && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200">
                    {errorMessage}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95"
                id="submit"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando pago...
                    </>
                ) : (
                    `Pagar ${formatCurrency(totalAmountCents / 100)}`
                )}
            </button>
            <p className="text-center text-xs text-[var(--ag-sys-color-text-muted)] mt-2">
                Pagos seguros procesados por Stripe.
            </p>
        </form>
    );
}
