"use client";

import React, { useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider, ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { Loader2, ArrowLeft } from "lucide-react";
import { createStripeAccountSession } from "@/app/dashboard/monedero/actions";
import { useRouter } from "next/navigation";

export function EmbeddedWalletOnboarding() {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const fetchClientSecret = async () => {
        const res = await createStripeAccountSession();
        if (res.error || !res.clientSecret) {
            throw new Error(res.error || "No se pudo obtener el secreto de sesión");
        }
        return res.clientSecret;
    };

    const handleStartOnboarding = async () => {
        setLoading(true);
        setError(null);
        try {
            // Pre-fetch the instance so it renders immediately
            const instance = await loadConnectAndInitialize({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
                fetchClientSecret,
                appearance: {
                    overlays: 'dialog',
                    variables: {
                        colorPrimary: '#059669', // var(--ag-sys-color-primary)
                        colorBackground: '#ffffff',
                    },
                },
            });
            setStripeConnectInstance(instance);
            setIsOpen(true);
        } catch (err: any) {
            setError(err.message || "Error al inicializar Stripe.");
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        setIsOpen(false);
        setStripeConnectInstance(null);
        // Refresh to check if onboarding is complete
        router.refresh();
    };

    if (isOpen && stripeConnectInstance) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 w-full mt-4">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--ag-sys-color-border)]">
                    <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">
                        Configuración segura con Stripe
                    </h3>
                    <button
                        onClick={handleExit}
                        className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancelar y volver
                    </button>
                </div>
                
                {/* The embedded onboarding component */}
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                    <ConnectAccountOnboarding onExit={handleExit} />
                </ConnectComponentsProvider>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start w-full">
            <button
                onClick={handleStartOnboarding}
                disabled={loading}
                className="whitespace-nowrap px-6 py-3 bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] disabled:bg-green-300 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Preparando panel seguro..." : "Configurar cobros seguros"}
            </button>
            {error && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                    Error: {error}
                </p>
            )}
        </div>
    );
}
