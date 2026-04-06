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
    // La categoría 1 se abre por defecto, pero ninguna pregunta está activa para mostrar el Empty State "premium".
    const [activeCategory, setActiveCategory] = useState<string | null>(faqs[0].id);
    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

    const currentFaq = faqs.find(cat => cat.id === activeCategory);
    const currentQ = activeQuestion !== null && currentFaq ? currentFaq.questions[activeQuestion] : null;

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-surface)]">
            {/* Header Area Magazine style (blanco puro) */}
            <div className="pt-16 pb-12 px-4 sm:px-6 w-full border-b border-[var(--ag-sys-color-border)]">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-[var(--ag-sys-color-primary)]/10 rounded-2xl mb-5">
                        <HelpCircle className="w-8 h-8 text-[var(--ag-sys-color-primary)]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-6">
                        Preguntas <span className="text-[var(--ag-sys-color-primary)]">Frecuentes</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text-muted)] leading-relaxed max-w-2xl mx-auto">
                        Encuentra las respuestas más rápidas y sencillas sobre cómo utilizar la plataforma Ruralpop.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto max-w-6xl px-4 pt-12 pb-24 flex flex-col md:flex-row items-start gap-12 lg:gap-20">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0">
                    <div className="sticky top-24">
                        <nav className="flex flex-col space-y-4">
                            {faqs.map(cat => {
                                const isCatExpanded = activeCategory === cat.id;

                                return (
                                    <div key={cat.id} className="flex flex-col">
                                        <button
                                            onClick={() => {
                                                if (isCatExpanded) {
                                                    setActiveCategory(null);
                                                    setActiveQuestion(null);
                                                } else {
                                                    setActiveCategory(cat.id);
                                                    setActiveQuestion(null);
                                                }
                                            }}
                                            className={`text-left px-5 py-3.5 rounded-2xl font-bold transition-all text-lg flex items-center justify-between ${
                                                isCatExpanded 
                                                  ? "bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-primary)] shadow-sm" 
                                                  : "text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-background)] border border-transparent"
                                            }`}
                                        >
                                            {cat.category}
                                        </button>
                                        
                                        {/* Submenú tipo acordeón */}
                                        {isCatExpanded && (
                                            <ul className="mt-4 ml-6 pl-4 border-l-2 border-[var(--ag-sys-color-border)] space-y-4 mb-2 animate-in slide-in-from-top-2 duration-200">
                                                {cat.questions.map((q, idx) => {
                                                    const isQuestionActive = isCatExpanded && activeQuestion === idx;
                                                    return (
                                                        <li key={idx}>
                                                            <button 
                                                                onClick={() => setActiveQuestion(idx)}
                                                                className={`text-left text-base transition-colors block line-clamp-3 leading-relaxed hover:text-[var(--ag-sys-color-primary)] ${
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

                {/* FAQ Content Area - Totalmente libre de cards, sobre fondo blanco asimilando el texto */}
                <main className="flex-1 w-full min-w-0 min-h-[500px]">
                    {activeQuestion === null || !currentQ ? (
                        <div className="flex flex-col items-start text-left pt-6 animate-in fade-in duration-300 w-full">
                            <div className="p-4 bg-[var(--ag-sys-color-primary)]/10 rounded-2xl mb-6">
                                <HelpCircle className="w-10 h-10 text-[var(--ag-sys-color-primary)] opacity-80" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                ¿En qué podemos ayudarte?
                            </h2>
                            <p className="text-[var(--ag-sys-color-text-muted)] text-xl w-full leading-relaxed">
                                Selecciona cualquier pregunta del menú interactivo de la izquierda para descubrir la respuesta paso a paso.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300 flex-1 flex flex-col justify-start">
                            {/* Path de Navegación sutil */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--ag-sys-color-background)] rounded-full text-xs font-bold tracking-wider uppercase text-[var(--ag-sys-color-primary)] mb-8 self-start border border-[var(--ag-sys-color-border)]">
                                {currentFaq?.category}
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ag-sys-color-text)] pb-8 mb-8 flex items-start gap-3 leading-tight border-b border-[var(--ag-sys-color-border)]">
                                {currentQ?.q}
                            </h2>
                            
                            <div className="text-[var(--ag-sys-color-text-muted)] text-lg md:text-xl leading-relaxed space-y-6 max-w-4xl">
                                {currentQ?.a.split('\n').map((line, lIdx) => (
                                    <p key={lIdx} className="flex gap-2">
                                        <span>{line}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
