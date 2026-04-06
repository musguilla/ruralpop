'use client';

import React, { useState } from 'react';
import { HelpCircle } from "lucide-react";

type Question = {
    q: string;
    a: string;
};

type FAQCategory = {
    category: string;
    id: string;
    questions: Question[];
};

export default function FAQClient({ faqs }: { faqs: FAQCategory[] }) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const currentFaq = faqs.find(cat => cat.id === activeCategory);

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            {/* Header Area styled like Tractores */}
            <div className="py-12 px-4 sm:px-6 bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] shadow-sm">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-[var(--ag-sys-color-primary)]/10 rounded-2xl mb-4">
                        <HelpCircle className="w-8 h-8 text-[var(--ag-sys-color-primary)]" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        Preguntas frecuentes
                    </h1>
                    <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed max-w-2xl mx-auto">
                        Encuentra las respuestas más rápidas y sencillas sobre cómo utilizar la plataforma Ruralpop.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto max-w-6xl px-4 py-12 flex flex-col md:flex-row gap-12">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-72 md:flex-shrink-0">
                    <div className="sticky top-24">
                        <nav className="flex flex-col space-y-2 bg-[var(--ag-sys-color-surface)] p-6 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
                            {faqs.map(cat => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${
                                            isActive 
                                              ? "bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]" 
                                              : "text-[var(--ag-sys-color-text)] hover:bg-gray-50"
                                        }`}
                                    >
                                        {cat.category}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* FAQ Content */}
                <main className="flex-1">
                    {!activeCategory ? (
                        <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-10 text-center shadow-sm h-full flex flex-col justify-center items-center">
                            <div className="p-4 bg-[var(--ag-sys-color-primary)]/10 rounded-full mb-6">
                                <HelpCircle className="w-12 h-12 text-[var(--ag-sys-color-primary)] opacity-80" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-3">
                                ¿En qué podemos ayudarte?
                            </h2>
                            <p className="text-[var(--ag-sys-color-text-muted)] text-lg max-w-md">
                                Selecciona una categoría en el menú lateral para descubrir cómo utilizar Ruralpop paso a paso.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] border-b pb-6">
                                {currentFaq?.category}
                            </h2>
                            
                            <div className="space-y-12">
                                {currentFaq?.questions.map((q, idx) => (
                                    <article key={idx} className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] p-6 rounded-2xl shadow-sm">
                                        <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-4 flex items-start gap-2">
                                            <span className="text-[var(--ag-sys-color-primary)] mt-1 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                            </span>
                                            {q.q}
                                        </h3>
                                        <div className="text-[var(--ag-sys-color-text-muted)] leading-relaxed space-y-3 pl-7">
                                            {q.a.split('\n').map((line, lIdx) => (
                                                <p key={lIdx} className="flex gap-2">
                                                    <span>{line}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
