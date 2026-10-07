"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { submitContact } from "./actions";
import { useTranslation } from "@/context/LocaleContext";

export interface ContactPageProps {
    isEquipop?: boolean;
}

export default function ContactPage({ isEquipop = false }: ContactPageProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [clientIsEquipop, setClientIsEquipop] = useState(isEquipop);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            if (hostname.includes("ruralpop")) {
                setClientIsEquipop(false);
            } else if (hostname.includes("equipop")) {
                setClientIsEquipop(true);
            } else {
                setClientIsEquipop(isEquipop);
            }
        }
    }, [isEquipop]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const formData = new FormData(e.currentTarget);

        try {
            const res = await submitContact(formData);
            if (res.success) {
                setSuccessMsg(res.message || t('contact.sent_success'));
                (e.target as HTMLFormElement).reset();
            } else {
                setErrorMsg(res.error || t('contact.sent_error'));
            }
        } catch (error) {
            setErrorMsg(t('contact.connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">{t('contact.title')}</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">{t('contact.desc')}</p>
                    </div>
                </header>

                <div className="space-y-8">
                    <p className="text-[var(--ag-sys-color-text)] leading-relaxed">
                        {clientIsEquipop ? t('contact.intro').replace('Ruralpop', 'Equipop') : t('contact.intro')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Formulario */}
                        <div>
                            {successMsg ? (
                                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl flex flex-col items-center justify-center h-full text-center border border-emerald-200">
                                    <MessageSquare className="w-12 h-12 mb-3 text-emerald-500" />
                                    <h3 className="text-lg font-bold mb-1">{t('contact.sent_title')}</h3>
                                    <p className="text-sm">{successMsg}</p>
                                    <button
                                        type="button"
                                        onClick={() => setSuccessMsg("")}
                                        className="mt-6 text-sm font-semibold underline text-emerald-800"
                                    >
                                        {t('contact.send_another')}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    {errorMsg && (
                                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div>
                                        <input type="hidden" name="isEquipop" value={clientIsEquipop ? "true" : "false"} />
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('contact.name_label')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                                            placeholder={t('contact.name_ph')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('contact.email_label')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                                            placeholder={t('contact.email_ph')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('contact.subject_label')}</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                                            placeholder={t('contact.subject_ph')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('contact.message_label')}</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition resize-none"
                                            placeholder={t('contact.message_ph')}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="mt-2 flex items-center justify-center gap-2 bg-[var(--ag-sys-color-primary)] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                                    >
                                        {isLoading ? t('contact.submitting') : t('contact.submit')}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Bloques de info derecha */}
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
                                <div className="text-blue-600 shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-1">{t('contact.box1_title')}</h4>
                                    <p className="text-sm text-blue-700/80 leading-relaxed">
                                        {t('contact.box1_desc')}
                                    </p>
                                </div>
                            </div>

                            {!clientIsEquipop && (
                                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
                                    <div className="text-yellow-600 shrink-0">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-yellow-800 mb-1">{t('contact.box2_title')}</h4>
                                        <p className="text-sm text-yellow-700/80 leading-relaxed">
                                            {t('contact.box2_desc')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Sincronización de Host en Cliente: Al compartir componentes entre múltiples
 *      dominios en una arquitectura Next.js Multi-Tenant (Ruralpop / Equipop), un prop inicial
 *      `isEquipop` podía desincronizarse si el usuario navegaba a través de rutas cacheadas o
 *      enlaces con parámetros erróneos. Validar `window.location.hostname` en `useEffect`
 *      fuerza que un usuario en `ruralpop.com` siempre envíe `isEquipop=false`.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Acceso a `/equipop/contact` desde dominio `ruralpop.com`: El estado local `clientIsEquipop`
 *      corrige inmediatamente la apariencia y el valor del hidden input a `false`.
 *    - Desacoplamiento de textos y cajas informativas: La caja sobre animales / núcleo zoológico
 *      únicamente se renderiza si `!clientIsEquipop`.
 * 
 * 3. Lecciones Aprendidas:
 *    - Nunca depender exclusivamente del valor enviado en un input hidden de formulario para
 *      decisiones críticas de enrutamiento o seguridad en el servidor. Debe haber validación
 *      cruzada con headers HTTP en el backend.
 * -----------------------------------------------------------------------------
 */
