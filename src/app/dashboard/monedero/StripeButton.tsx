"use client";

import { useState } from "react";
import { createStripeOnboardingLink } from "./actions";

export function StripeButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await createStripeOnboardingLink();
            if (res.error) {
                setError(res.error);
            } else if (res.url) {
                window.location.href = res.url;
            }
        } catch (err: any) {
            setError(err.message || "Error desconocido al conectar con Stripe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end">
            <button 
                onClick={handleConnect}
                disabled={isLoading}
                className="whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
                {isLoading ? "Conectando..." : "Configurar cobros seguros"}
            </button>
            {error && (
                <p className="text-red-500 text-sm mt-2 max-w-sm text-right font-medium">
                    Error: {error}
                </p>
            )}
        </div>
    );
}
