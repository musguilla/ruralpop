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
    // Por defecto marcamos la primera categoría y su primer pregunta. Así no hay estados huecos.
    const [activeCategory, setActiveCategory] = useState<string>(faqs[0].id);
    const [activeQuestion, setActiveQuestion] = useState<number>(0);

    const currentFaq = faqs.find(cat => cat.id === activeCategory);
    const currentQ = currentFaq?.questions[activeQuestion];

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
                        <nav className="flex flex-col space-y-4">
                            {faqs.map(cat => {
                                const isCatExpanded = activeCategory === cat.id;

                                return (
                                    <div key={cat.id} className="flex flex-col">
                                        <button
                                            onClick={() => {
                                                setActiveCategory(cat.id);
                                                setActiveQuestion(0);
                                            }}
                                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all text-lg flex items-center justify-between ${
                                                isCatExpanded 
                                                  ? "bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]" 
                                                  : "text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-border)]"
                                            }`}
                                        >
                                            {cat.category}
                                            {isCatExpanded && <div className="w-2 h-2 rounded-full bg-[var(--ag-sys-color-primary)]" />}
                                        </button>
                                        
                                        {/* Submenú tipo acordeón: Solo se muestran las preguntas de la categoría activa */}
                                        {isCatExpanded && (
                                            <ul className="mt-3 ml-4 pl-4 border-l-2 border-[var(--ag-sys-color-border)] space-y-3 mb-2 animate-in slide-in-from-top-2 duration-200">
                                                {cat.questions.map((q, idx) => {
                                                    const isQuestionActive = isCatExpanded && activeQuestion === idx;
                                                    return (
                                                        <li key={idx}>
                                                            <button 
                                                                onClick={() => setActiveQuestion(idx)}
                                                                className={`text-left text-sm transition-colors block line-clamp-3 leading-relaxed hover:text-[var(--ag-sys-color-primary)] ${
                                                                    isQuestionActive 
                                                                        ? 'text-[var(--ag-sys-color-primary)] font-bold' 
                                                                        : 'text-[var(--ag-sys-color-text-muted)]'
                                                                }`}
                                                            >
                                                                {q.q}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* FAQ Content Area Blanca unificada */}
                <main className="flex-1 w-full min-w-0">
                    <div className="bg-white border border-[var(--ag-sys-color-border)] rounded-3xl p-8 sm:p-12 shadow-sm min-h-[500px] flex flex-col">
                        <div className="animate-in fade-in duration-300">
                            {/* Path de Navegación sutil */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--ag-sys-color-background)] rounded-full text-xs font-bold tracking-wider uppercase text-[var(--ag-sys-color-primary)] mb-6">
                                {currentFaq?.category}
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ag-sys-color-text)] border-b border-[var(--ag-sys-color-border)] pb-8 mb-8 flex items-start gap-3 leading-tight">
                                {currentQ?.q}
                            </h2>
                            
                            <div className="text-[var(--ag-sys-color-text-muted)] lg:text-lg leading-relaxed space-y-5">
                                {currentQ?.a.split('\n').map((line, lIdx) => (
                                    <p key={lIdx} className="flex gap-2">
                                        <span>{line}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
