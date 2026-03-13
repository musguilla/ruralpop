"use client";

import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { STRIPE_PLANS } from "./FeaturedCheckoutFlow";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

export function CheckoutForm({ planId, listingId }: { planId: string, listingId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { showAlert } = useNotification();
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const plan = STRIPE_PLANS.find(p => p.id === planId);

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
                // Returns to this URL after payment success
                return_url: `${window.location.origin}/dashboard?featured_success=true`,
            },
        });

        if (error) {
            setErrorMessage(error.message ?? "Ocurrió un error inesperado al procesar el pago.");
            setIsLoading(false);
        } else {
            // Success is handled by the redirect to return_url and webhooks
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-[var(--ag-sys-color-border)] mb-6">
                <h4 className="font-bold text-[var(--ag-sys-color-text)] flex justify-between">
                    <span>Resumen: {plan?.name}</span>
                    <span className="text-[var(--ag-sys-color-primary)]">{plan?.price.toString().replace('.', ',')}€</span>
                </h4>
                <p className="text-sm text-[var(--ag-sys-color-text-muted)] mt-1">
                    {plan?.description}
                </p>
            </div>

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
                className="w-full py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                id="submit"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando pago...
                    </>
                ) : (
                    `Pagar ${plan?.price.toString().replace('.', ',')}€`
                )}
            </button>
            <p className="text-center text-xs text-[var(--ag-sys-color-text-muted)] mt-4">
                Pagos seguros procesados por Stripe.
            </p>
        </form>
    );
}
