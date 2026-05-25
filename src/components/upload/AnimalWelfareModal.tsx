"use client";

import React, { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "@/components/dashboard/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface AnimalWelfareModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    listingSlug: string;
    initialData?: {
        name?: string;
        nif?: string;
        contact_phone?: string;
        zoo_register_number?: string;
    };
}

export function AnimalWelfareModal({ isOpen, onClose, listingId, listingSlug, initialData }: AnimalWelfareModalProps) {
    const [step, setStep] = useState<'info' | 'form' | 'payment'>('info');
    
    // Form fields
    const [name, setName] = useState(initialData?.name || "");
    const [lastName, setLastName] = useState("");
    const [nif, setNif] = useState(initialData?.nif || "");
    const [phone, setPhone] = useState(initialData?.contact_phone || "");
    const [zooRegister, setZooRegister] = useState(initialData?.zoo_register_number || "");
    
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleProceedToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !nif || !phone || !zooRegister) {
            setError("Por favor, rellena todos los campos obligatorios.");
            return;
        }

        setIsCreatingIntent(true);
        setError(null);

        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    listingId, 
                    planId: "animal_welfare_validation",
                    welfareDetails: {
                        name,
                        lastName,
                        nif,
                        phone,
                        zoo_register_number: zooRegister
                    }
                }),
            });

            if (!res.ok) throw new Error("Error creando el pago");

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setStep('payment');
        } catch (error) {
            console.error("Error al inicializar el pago:", error);
            setError("Ha ocurrido un error al conectar con el procesador de pagos.");
        } finally {
            setIsCreatingIntent(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--ag-sys-color-surface)] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 sm:p-8">
                    
                    {step === 'info' && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] leading-tight">
                                Anuncios para profesionales
                            </h3>
                            
                            <div className="text-sm text-[var(--ag-sys-color-text-muted)] space-y-4">
                                <p>
                                    La Ley de Bienestar Animal (Ley 7/2023) en España limita la publicación de anuncios de determinados animales de compañía por parte de usuarios particulares en plataformas online.
                                </p>
                                <p>
                                    Para publicar anuncios de perros, aves de compañía y otros animales regulados, es necesario disponer de un perfil profesional verificado donde debes introducir número de registro de núcleo zoológico, explotación o criadero.
                                </p>
                                <p>
                                    En Ruralpop puedes hacerlo de forma sencilla activando <strong>Ruralpop Pro por solo 1,99€</strong>, lo que te permitirá:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 font-semibold text-[var(--ag-sys-color-text)]">
                                    <li>Publicar anuncios autorizados</li>
                                    <li>Mostrar tu perfil como profesional verificado</li>
                                    <li>Cumplir con la normativa vigente</li>
                                    <li>Generar mayor confianza a los compradores</li>
                                </ul>
                                <p className="text-xs text-gray-400 italic pt-2">
                                    * Nota: Este pago es necesario para validar cada anuncio de este tipo, el cual se guardará como borrador hasta completar el pago.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--ag-sys-color-border)]">
                                <button
                                    onClick={() => setStep('form')}
                                    className="w-full py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-opacity"
                                >
                                    Activar Ruralpop Pro · 1,99€
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">
                                Datos del Profesional / Criador
                            </h3>
                            <p className="text-sm text-[var(--ag-sys-color-text-muted)]">
                                Completa tus datos fiscales para poder validar el anuncio. Esta información se guardará en tu perfil.
                            </p>

                            <form onSubmit={handleProceedToPayment} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Apellidos</label>
                                        <input 
                                            type="text" 
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">NIF / CIF</label>
                                    <input 
                                        type="text" 
                                        value={nif} 
                                        onChange={(e) => setNif(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono de Contacto</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--ag-sys-color-primary)] mb-1 uppercase tracking-wider">
                                        Nº Reg. Núcleo Zoológico / Explotación
                                    </label>
                                    <input 
                                        type="text" 
                                        value={zooRegister} 
                                        onChange={(e) => setZooRegister(e.target.value)}
                                        required
                                        className="w-full bg-[var(--ag-sys-color-primary)]/5 border-2 border-[var(--ag-sys-color-primary)]/20 rounded-xl px-4 py-3 text-sm focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        placeholder="Ej: ES123456789"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-[var(--ag-sys-color-border)]">
                                    <button
                                        type="submit"
                                        disabled={isCreatingIntent}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isCreatingIntent && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Continuar al pago (1,99€)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('info')}
                                        className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Volver
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'payment' && clientSecret && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">
                                Validar anuncio
                            </h3>
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                {/* We reuse CheckoutForm. It redirects to dashboard with featured_success=true. 
                                    We might want to pass a different return_url, but we'll stick to the existing component logic for simplicity,
                                    or the user can see it in dashboard as active. */}
                                <CheckoutForm planId="animal_welfare_validation" listingId={listingId} />
                            </Elements>
                            <button
                                onClick={() => setStep('form')}
                                className="w-full mt-4 py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar y volver
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - El modal bloquea la UI principal y obliga a pasar por los tres estados: Info -> Formulario -> Pago.
 * - Guardamos los datos fiscales como metadatos en Stripe para que el webhook los procese de manera segura tras el pago.
 * - Usamos CheckoutForm que ya incorpora Elements y redirige a la dashboard tras el éxito.
 */
