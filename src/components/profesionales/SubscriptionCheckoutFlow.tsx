"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { SubscriptionCheckoutForm } from "./SubscriptionCheckoutForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export function SubscriptionCheckoutFlow({ planId, priceId, isAnnual }: { planId: string, priceId: string, isAnnual?: boolean }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isCreatingIntent, setIsCreatingIntent] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createSubscriptionIntent = async () => {
            try {
                const res = await fetch("/api/create-subscription", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId }),
                });

                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || "Error inicializando configuración de pago.");
                }

                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setIsCreatingIntent(false);
            }
        };

        createSubscriptionIntent();
    }, [priceId]);

    const planName = planId === "start" ? "Plan Start" : (isAnnual ? "Plan Pro (Anual)" : "Plan Pro");
    const planPrice = planId === "start" ? "19,99€" : (isAnnual ? "450 €" : "49,99€");

    return (
        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 sm:p-10 border border-[var(--ag-sys-color-border)] shadow-md relative">
            <Link href="/profesionales" className="absolute top-6 left-6 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors flex items-center gap-2 text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Volver
            </Link>
            
            <div className="mt-8 mb-8 pb-4 border-b border-[var(--ag-sys-color-border)] text-center">
                <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)]">
                    Pago de Suscripción a <span className="text-[var(--ag-sys-color-primary)]">{planName}</span>
                </h3>
            </div>

            {isCreatingIntent ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[var(--ag-sys-color-primary)] animate-spin mb-4"></div>
                    <p className="text-[var(--ag-sys-color-text-muted)] font-medium">Preparando pago seguro...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
                    <p className="font-semibold mb-2">No se pudo inicializar el pago</p>
                    <p className="text-sm">{error}</p>
                    <Link href="/profesionales" className="mt-4 inline-block px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                        Cancelar y volver
                    </Link>
                </div>
            ) : clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <SubscriptionCheckoutForm planName={planName} planPrice={planPrice} />
                </Elements>
            )}
        </div>
    );
}
