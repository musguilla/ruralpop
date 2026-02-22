"use client";

import React from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Contacto</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Estamos aquí para ayudarte</p>
                    </div>
                </header>

                <div className="space-y-8">
                    <p className="text-[var(--ag-sys-color-text)] leading-relaxed">
                        ¿Tienes problemas técnicos, alertas sobre anuncios fraudulentos o dudas sobre cómo funciona Ruralpop? Ponte en contacto con nosotros para un soporte directo.
                    </p>

                    <div className="grid grid-cols-1 max-w-md">
                        <div className="flex flex-col gap-4 p-6 bg-[var(--ag-sys-color-background)] rounded-2xl border border-[var(--ag-sys-color-border)]">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--ag-sys-color-text)]">Email Soporte</h3>
                                    <p className="text-sm text-[var(--ag-sys-color-text-muted)]">Respuesta en 24h</p>
                                </div>
                            </div>
                            <a href="mailto:hola@ruralpop.com" className="text-[var(--ag-sys-color-primary)] font-bold hover:underline">
                                hola@ruralpop.com
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
                        <div className="text-yellow-600 shrink-0">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-yellow-800 mb-1">Feedback de la comunidad</h4>
                            <p className="text-sm text-yellow-700/80 leading-relaxed">
                                Constantemente implementamos mejoras de los usuarios (como el nuevo chat). Si echas en falta alguna categoría, subcategoría o utilidad, no dudes en escribirnos un correo exigiéndolo. ¡A eso venimos!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de contacto para resolver enlaces rotos de /contact.
 * - Diseño usando Flex/Grid para hacer layout fácil con TailwindCSS.
 */
