"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PhoneRevealButtonProps {
    phone: string;
    isLoggedIn: boolean;
}

export function PhoneRevealButton({ phone, isLoggedIn }: PhoneRevealButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-border)] transition-all active:scale-95"
            >
                <Phone className="w-5 h-5" />
                Ver teléfono
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">
                                {isLoggedIn ? "Teléfono de contacto" : "Identificación requerida"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 text-center bg-gray-50">
                            {isLoggedIn ? (
                                <a href={`tel:${phone}`} className="text-3xl font-black text-[var(--ag-sys-color-primary)] tracking-wider block hover:underline transition-all active:scale-95">
                                    {phone}
                                </a>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-gray-600 font-medium">Crea una cuenta o inicia sesión gratis para poder ver el teléfono del vendedor y contactar.</p>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="w-full px-6 py-3 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all active:scale-95"
                                    >
                                        Iniciar sesión / Registro
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Botón tipo "reveal" para evitar bots o scraping directo de tlf en HTML simple.
 * - Bloqueado si no isLoggedIn. Aporta valor a registrarse para ver contactos.
 */
