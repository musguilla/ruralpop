"use client";

import React, { useState } from "react";
import { ArrowUpCircle, Sparkles, Crown, ArrowLeft, ShieldCheck } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "@/components/dashboard/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export const STRIPE_PLANS = [
    {
        id: "bump",
        name: "Subir arriba",
        description: "Dale un empujón a tu anuncio y colócalo de nuevo en primera posición.",
        price: 1.49,
        priceId: "price_bump", // To be defined or handled dynamically
        icon: ArrowUpCircle,
        color: "blue",
        badge: null
    },
    {
        id: "highlight_7",
        name: "Destacar 7 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 7 días en su categoría.",
        price: 2.99,
        priceId: "price_hl_7",
        icon: Sparkles,
        color: "green",
        badge: "el más vendido"
    },
    {
        id: "highlight_20",
        name: "Destacar 20 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 20 días en su categoría.",
        price: 4.99,
        priceId: "price_hl_20",
        icon: Crown,
        color: "amber",
        badge: null
    }
];

import { useRouter } from "next/navigation";

export interface FeaturedCheckoutFlowProps {
    listingId: string;
    isProfesional?: boolean;
    availableFeatured?: number;
    availableBumps?: number;
    isNewlyPublished?: boolean;
}

export function FeaturedCheckoutFlow({ 
    listingId, 
    isProfesional = false, 
    availableFeatured = 0, 
    availableBumps = 0,
    isNewlyPublished = false
}: FeaturedCheckoutFlowProps) {
    const router = useRouter();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    const handleSelectPlan = async (planId: string) => {
        setSelectedPlanId(planId);
        setIsCreatingIntent(true);
        setClientSecret(null);

        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, planId }),
            });

            if (!res.ok) throw new Error("Error creando el pago");

            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error("Error al inicializar el pago:", error);
            alert("Ha ocurrido un error al conectar con el procesador de pagos.");
            setSelectedPlanId(null);
        } finally {
            setIsCreatingIntent(false);
        }
    };

    const handleProActivation = async (type: 'highlight' | 'bump') => {
        if (isActivating) return;
        setIsActivating(true);

        try {
            const res = await fetch("/api/activate-professional-feature", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, type }),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Error al activar la funcionalidad.");
            }

            router.push("/dashboard?success=activated");
            router.refresh();
        } catch (error) {
            console.error("Error activating feature:", error);
            alert(error instanceof Error ? error.message : "Error al procesar la solicitud.");
        } finally {
            setIsActivating(false);
        }
    };

    if (isProfesional) {
        return (
            <div className="space-y-8 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Professional Highlight Option */}
                    <div className="bg-[var(--ag-sys-color-primary)]/5 rounded-[2.5rem] p-8 border-2 border-[var(--ag-sys-color-primary)]/20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--ag-sys-color-primary)] text-white flex items-center justify-center mb-6 shadow-lg shadow-[var(--ag-sys-color-primary)]/20">
                            <Crown className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">Destacar 20 días</h3>
                        <p className="text-sm text-[var(--ag-sys-color-text-muted)] mb-8 max-w-[240px]">
                            Tu anuncio aparecerá en primeras posiciones durante los próximos 20 días.
                        </p>
                        
                        <div className="mt-auto w-full">
                            <div className="flex items-center justify-center gap-2 mb-6 text-[var(--ag-sys-color-primary)] font-bold text-sm">
                                <span className="px-3 py-1 bg-[var(--ag-sys-color-primary)]/10 rounded-full border border-[var(--ag-sys-color-primary)]/10">
                                    {availableFeatured} disponibles
                                </span>
                            </div>

                            <button
                                onClick={() => handleProActivation('highlight')}
                                disabled={availableFeatured <= 0 || isActivating}
                                className="w-full py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[var(--ag-sys-color-primary)]/10"
                            >
                                {isActivating ? 'Activando...' : 'Destacar ahora'}
                            </button>
                        </div>
                    </div>

                    {/* Return or Other Info */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[var(--ag-sys-color-border)] flex flex-col items-center text-center justify-center">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 text-gray-400 flex items-center justify-center mb-6 border border-gray-100">
                            <ArrowUpCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-3">Subir anuncio (Bump)</h3>
                        <p className="text-sm text-gray-400 mb-8 max-w-[240px]">
                            Usa tus impulsos disponibles para colocar tu anuncio arriba del todo.
                        </p>
                        <div className="mt-auto w-full">
                            <div className="flex items-center justify-center gap-2 mb-6 text-gray-400 font-bold text-sm">
                                <span className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                    {availableBumps} disponibles
                                </span>
                            </div>
                            <button
                                onClick={() => handleProActivation('bump')}
                                disabled={availableBumps <= 0 || isActivating}
                                className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Subir anuncio
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col items-center">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-[var(--ag-sys-color-text-muted)] hover:text-[#059669] font-bold text-sm flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        No deseo destacarlo ahora, volver a mi panel
                    </button>
                </div>
            </div>
        );
    }

    if (clientSecret) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 sm:p-10 border border-[var(--ag-sys-color-border)] shadow-md">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--ag-sys-color-border)]">
                    <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">
                        Completa tu pago de forma segura
                    </h3>
                    <button 
                        onClick={() => { setSelectedPlanId(null); setClientSecret(null); }}
                        className="text-sm font-semibold text-[var(--ag-sys-color-text-muted)] hover:text-[#059669] transition-colors"
                    >
                        Cambiar plan
                    </button>
                </div>
                
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm planId={selectedPlanId!} listingId={listingId} />
                </Elements>
            </div>
        );
    }

    const plansToShow = isNewlyPublished 
        ? STRIPE_PLANS.filter(p => p.id !== "bump")
        : STRIPE_PLANS;

    return (
        <div className="space-y-6 mb-16">
            <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6">Selecciona un plan</h3>
            <div className={`grid grid-cols-1 md:grid-cols-${plansToShow.length} gap-6`}>
                {plansToShow.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlanId === plan.id;
                    const isLoading = isCreatingIntent && isSelected;

                    const colorMap = {
                        blue: "border-blue-200 bg-blue-50/30 hover:border-blue-400 group-hover:text-blue-600",
                        green: "border-green-200 bg-green-50/30 hover:border-[#059669] group-hover:text-[#059669]",
                        amber: "border-amber-200 bg-amber-50/30 hover:border-amber-500 group-hover:text-amber-500"
                    };

                    const activeColorClass = colorMap[plan.color as keyof typeof colorMap];

                    return (
                        <div
                            key={plan.id}
                            className={`relative group flex flex-col p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden ${
                                isSelected ? activeColorClass.replace('hover:', '') : 'border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] hover:border-gray-300'
                            }`}
                            onClick={() => !isCreatingIntent && handleSelectPlan(plan.id)}
                            style={{ opacity: isCreatingIntent && !isSelected ? 0.5 : 1 }}
                        >
                            {/* Recomendado Badge */}
                            {plan.badge && (
                                <div className="absolute top-0 right-0 bg-[#059669] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10">
                                    {plan.badge}
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isSelected ? colorMap[plan.color as keyof typeof colorMap].split(' ')[1] : 'bg-[var(--ag-sys-color-background)] group-hover:bg-gray-100'}`}>
                                <Icon className={`w-6 h-6 ${isSelected ? colorMap[plan.color as keyof typeof colorMap].split(' ').pop() : 'text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-text)]'}`} />
                            </div>

                            <h4 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-2">{plan.name}</h4>
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mb-6 flex-1">
                                {plan.description}
                            </p>

                            <div className="mt-auto">
                                <div className="text-3xl font-black text-[var(--ag-sys-color-primary)] mb-4">
                                    {plan.price.toString().replace('.', ',')}€
                                </div>

                                <button 
                                    disabled={isCreatingIntent}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                        isSelected 
                                        ? "bg-gray-800 text-white" 
                                        : plan.id === "highlight_7"
                                            ? "bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] shadow-md shadow-[var(--ag-sys-color-primary)]/20"
                                            : "bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] group-hover:bg-gray-800 group-hover:text-white"
                                    }`}
                                >
                                    {isLoading ? 'Cargando...' : 'Seleccionar'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa en componentes: FeaturedCheckoutFlow gestiona el estado Local, la pre-creación de "PaymentIntent" y dibuja los planes.
 * - Elemento `<Elements>` de Stripe envuelve el Checkout final (CreditCard form).
 * - "el más vendido" se muestra como un badge `rounded-bl-xl` para el plan de 7 días.
 */
