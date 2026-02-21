"use client";

import React, { useState } from "react";
import { MessageCircle, X, ShieldCheck, Tractor } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChatButtonProps {
    listingId: string;
    isLoggedIn: boolean;
}

export function ChatButton({ listingId, isLoggedIn }: ChatButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleChatClick = () => {
        if (!isLoggedIn) {
            setShowModal(true);
        } else {
            router.push(`/chat/${listingId}`);
        }
    };

    return (
        <>
            <button
                onClick={handleChatClick}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95"
            >
                <MessageCircle className="w-5 h-5" />
                Chat con el vendedor
            </button>

            {/* Auth Incentive Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative bg-[var(--ag-sys-color-surface)] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--ag-sys-color-background)] transition-colors text-[var(--ag-sys-color-text-muted)]"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Content */}
                        <div className="p-8 sm:p-10 pt-12 text-center">
                            <div className="mx-auto w-20 h-20 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-3xl flex items-center justify-center mb-6">
                                <Tractor className="w-10 h-10" />
                            </div>

                            <h3 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-3 leading-tight">
                                Únete a la comunidad de Ruralpop
                            </h3>

                            <p className="text-[var(--ag-sys-color-text-muted)] mb-8 leading-relaxed">
                                Necesitas estar registrado para chatear con los vendedores, guardar favoritos y gestionar tus anuncios.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    href="/register"
                                    className="block w-full py-4 px-6 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95"
                                >
                                    Crear cuenta gratis
                                </Link>
                                <Link
                                    href="/login"
                                    className="block w-full py-4 px-6 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-semibold rounded-2xl hover:bg-[var(--ag-sys-color-border)] transition-all"
                                >
                                    Iniciar sesión
                                </Link>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[var(--ag-sys-color-border)]">
                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-600 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" />
                                    Ruralpop Seguro
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
