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
            {/* Header Area sin fondo ni bordes oscuros */}
            <div className="pt-12 pb-6 px-4 sm:px-6">
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
            <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-start gap-10">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-[320px] flex-shrink-0">
                    <div className="sticky top-24">
                        <nav className="flex flex-col space-y-6">
                            {faqs.map(cat => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <div key={cat.id} className="flex flex-col">
                                        <button
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all text-lg flex items-center justify-between ${
                                                isActive 
                                                  ? "bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]" 
                                                  : "text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-border)]"
                                            }`}
                                        >
                                            {cat.category}
                                            {isActive && <div className="w-2 h-2 rounded-full bg-[var(--ag-sys-color-primary)]" />}
                                        </button>
                                        
                                        {/* List of questions under title - shown with some indent, active styling inherits context */}
                                        <ul className="mt-3 ml-4 pl-4 border-l-2 border-[var(--ag-sys-color-border)] space-y-2.5">
                                            {cat.questions.map((q, idx) => (
                                                <li key={idx}>
                                                    <button 
                                                        onClick={() => setActiveCategory(cat.id)}
                                                        className={`text-left text-sm transition-colors block line-clamp-2 ${isActive ? 'text-[var(--ag-sys-color-primary)] font-medium' : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]'}`}
                                                    >
                                                        {q.q}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* FAQ Content Area Blanca unificada */}
                <main className="flex-1 w-full min-w-0">
                    <div className="bg-white border border-[var(--ag-sys-color-border)] rounded-3xl p-8 sm:p-12 shadow-sm min-h-[500px]">
                        {!activeCategory ? (
                            <div className="h-full flex flex-col justify-center items-center text-center pt-20 pb-20 fade-in duration-300">
                                <div className="p-4 bg-[var(--ag-sys-color-primary)]/10 rounded-full mb-6">
                                    <HelpCircle className="w-12 h-12 text-[var(--ag-sys-color-primary)] opacity-80" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-3">
                                    ¿En qué podemos ayudarte?
                                </h2>
                                <p className="text-[var(--ag-sys-color-text-muted)] text-lg max-w-sm">
                                    Selecciona una categoría en el menú lateral para descubrir nuestras guías paso a paso.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] border-b border-[var(--ag-sys-color-border)] pb-6 mb-10">
                                    {currentFaq?.category}
                                </h2>
                                
                                <div className="space-y-12">
                                    {currentFaq?.questions.map((q, idx) => (
                                        <article key={idx} className="group">
                                            <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-4 flex items-start gap-3">
                                                <span className="text-[var(--ag-sys-color-primary)] mt-0.5 flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                </span>
                                                {q.q}
                                            </h3>
                                            <div className="text-[var(--ag-sys-color-text-muted)] lg:text-lg leading-relaxed space-y-4 pl-8">
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
                    </div>
                </main>
            </div>
        </div>
    );
}
