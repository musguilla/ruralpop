"use client";

import React, { useState } from "react";
import { MessageCircle, X, ShieldCheck, Tractor } from "lucide-react";
import { useRouter } from "next/navigation";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { useTranslation } from "@/context/LocaleContext";

interface ChatButtonProps {
    listingId: string;
    isLoggedIn: boolean;
    variant?: 'primary' | 'secondary';
}

export function ChatButton({ listingId, isLoggedIn, variant = 'primary' }: ChatButtonProps) {
    const { t, locale } = useTranslation();
    const isPt = locale === 'pt';
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
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 font-bold rounded-2xl transition-all active:scale-95 ${
                    variant === 'primary' 
                        ? "bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
                        : "bg-white border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] hover:bg-gray-50"
                }`}
            >
                <MessageCircle className={`w-5 h-5 ${variant === 'secondary' ? 'text-gray-400' : ''}`} />
                {t("chat_vendedor")}
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
                                {isPt ? "Junte-se à comunidade Ruralpop" : "Únete a la comunidad de Ruralpop"}
                            </h3>

                            <p className="text-[var(--ag-sys-color-text-muted)] mb-8 leading-relaxed">
                                {isPt 
                                    ? "Precisa de estar registado para conversar com os vendedores, guardar favoritos e gerir os seus anúncios." 
                                    : "Necesitas estar registrado para chatear con los vendedores, guardar favoritos y gestionar tus anuncios."}
                            </p>

                            <div className="space-y-4">
                                <LocalizedLink
                                    href="/register"
                                    className="block w-full py-4 px-6 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95 text-center"
                                >
                                    {isPt ? "Criar conta grátis" : "Crear cuenta gratis"}
                                </LocalizedLink>
                                <LocalizedLink
                                    href="/login"
                                    className="block w-full py-4 px-6 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-semibold rounded-2xl hover:bg-[var(--ag-sys-color-border)] transition-all text-center"
                                >
                                    {isPt ? "Iniciar sessão" : "Iniciar sesión"}
                                </LocalizedLink>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[var(--ag-sys-color-border)]">
                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-600 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" />
                                    {isPt ? "Ruralpop Seguro" : "Ruralpop Seguro"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
