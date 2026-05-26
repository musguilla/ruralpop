"use client";

import React, { useState } from "react";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "@/components/dashboard/CheckoutForm";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function ValidarPerfilPage() {
    const [step, setStep] = useState<'info' | 'form' | 'payment'>('info');
    
    // Form fields
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nif, setNif] = useState("");
    const [phone, setPhone] = useState("");
    const [zooRegister, setZooRegister] = useState("");
    
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleProceedToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !nif || !phone || !zooRegister) {
            setError("Por favor, rellena todos los campos obligatorios.");
            return;
        }

        setIsCreatingIntent(true);
        setError(null);

        try {
            const res = await fetch("/api/create-profile-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
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
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <Link href="/dashboard" className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al Panel
            </Link>

            <div className="bg-[var(--ag-sys-color-surface)] w-full rounded-3xl overflow-hidden shadow-sm border border-[var(--ag-sys-color-border)]">
                <div className="p-6 sm:p-10">
                    
                    {step === 'info' && (
                        <div className="space-y-6 max-w-xl mx-auto">
                            <div className="w-16 h-16 rounded-3xl bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            
                            <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] leading-tight">
                                Activa tu Perfil Profesional
                            </h1>
                            
                            <div className="text-[var(--ag-sys-color-text-muted)] space-y-4 text-lg">
                                <p>
                                    La Ley de Bienestar Animal (Ley 7/2023) en España limita la publicación de anuncios de determinados animales de compañía por parte de usuarios particulares en plataformas online.
                                </p>
                                <p>
                                    Para publicar anuncios de perros, aves de compañía y otros animales regulados, es necesario disponer de un perfil verificado donde debes introducir número de registro de núcleo zoológico, explotación o criadero.
                                </p>
                                <p>
                                    En Ruralpop puedes hacerlo de forma sencilla activando <strong>un Perfil Pro por solo 1,99€</strong>, lo que te permitirá:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-semibold text-[var(--ag-sys-color-text)]">
                                    <li>Publicar este anuncio autorizado</li>
                                    <li>Mostrar tu perfil como profesional verificado</li>
                                    <li>Cumplir con la normativa vigente</li>
                                    <li>Generar mayor confianza a los compradores</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-[var(--ag-sys-color-border)]">
                                <button
                                    onClick={() => setStep('form')}
                                    className="w-full py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-opacity text-lg"
                                >
                                    Comenzar Verificación
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-8 max-w-xl mx-auto">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">
                                    Datos del Profesional / Criador
                                </h2>
                                <p className="text-[var(--ag-sys-color-text-muted)] mt-2">
                                    Completa tus datos fiscales para poder validar tu perfil. Esta información se guardará de forma segura.
                                </p>
                            </div>

                            <form onSubmit={handleProceedToPayment} className="space-y-5">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre *</label>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Apellidos</label>
                                        <input 
                                            type="text" 
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">NIF / CIF *</label>
                                    <input 
                                        type="text" 
                                        value={nif} 
                                        onChange={(e) => setNif(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Teléfono de Contacto *</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--ag-sys-color-primary)] mb-2 uppercase tracking-wider">
                                        Nº Reg. Núcleo Zoológico / Explotación / Criadero *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={zooRegister} 
                                        onChange={(e) => setZooRegister(e.target.value)}
                                        required
                                        className="w-full bg-[var(--ag-sys-color-primary)]/5 border-2 border-[var(--ag-sys-color-primary)]/20 rounded-xl px-4 py-3 focus:border-[var(--ag-sys-color-primary)] focus:ring-0 outline-none transition-all"
                                        placeholder="Ej: ES123456789"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-6 border-t border-[var(--ag-sys-color-border)]">
                                    <button
                                        type="submit"
                                        disabled={isCreatingIntent}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--ag-sys-color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
                                    >
                                        {isCreatingIntent && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Continuar al pago (1,99€)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('info')}
                                        className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Volver atrás
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'payment' && clientSecret && (
                        <div className="space-y-8 max-w-xl mx-auto">
                            <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">
                                Pago Seguro
                            </h2>
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <CheckoutForm planId="profile_validation" listingId="profile" />
                            </Elements>
                            <button
                                onClick={() => setStep('form')}
                                className="w-full mt-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar y editar datos
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
 * - Esta página de validación de perfil es similar a AnimalWelfareModal, pero no está atada a un listingId concreto.
 * - Su objetivo es permitir a los usuarios verificar su perfil con el núcleo zoológico de forma proactiva.
 * - Hemos creado un nuevo endpoint 'create-profile-payment-intent' que no verifica listing_id.
 */
