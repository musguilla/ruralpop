"use client";

import React, { useState } from "react";
import { Histograms } from "./AdminStatCard";

export function AdminSalesChart({
    featured,
    subscriptions
}: {
    featured: Histograms;
    subscriptions: Histograms;
}) {
    const [filter, setFilter] = useState<'days' | 'weeks' | 'months'>('days');

    const chartFeatured = featured[filter];
    const chartSubs = subscriptions[filter];

    // Compute max for scaling (the tallest stacked bar)
    const maxVal = Math.max(...chartFeatured.map((h, i) => h.value + chartSubs[i].value));

    return (
        <div className="pt-6">
            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)]">Ventas totales</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-sm">Desglose de ingresos por línea de negocio</p>
                    </div>
                    
                    {/* Filtros temporales en la cabecera del card */}
                    <div className="flex gap-1.5 bg-[var(--ag-sys-color-background)] rounded-xl p-1 border border-[var(--ag-sys-color-border)]">
                        <button
                            onClick={() => setFilter('days')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'days' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                        >
                            Días
                        </button>
                        <button
                            onClick={() => setFilter('weeks')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'weeks' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                        >
                            Semanas
                        </button>
                        <button
                            onClick={() => setFilter('months')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'months' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                        >
                            Meses
                        </button>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-4 px-4 pt-4">
                    {chartFeatured.map((feat, i) => {
                        const sub = chartSubs[i];
                        const total = feat.value + sub.value;
                        const heightPercent = maxVal > 0 ? (total / maxVal) * 100 : 0;
                        
                        // Los % relativos de cada bloque sobre el bloque individual, para apilar visualmente
                        const subH = total > 0 ? (sub.value / total) * 100 : 0;
                        const featH = total > 0 ? (feat.value / total) * 100 : 0;
                        
                        // Rescatamos el nombre del periodo (limpio, quitando el precio) del string generado por el backend
                        const labelParts = feat.tooltip.split(' - ');
                        const label = labelParts[labelParts.length - 1];

                        return (
                            <div key={i} className="flex-1 group relative h-full flex flex-col justify-end items-center">
                                <div
                                    className="w-full flex flex-col justify-end rounded-t-lg transition-all cursor-pointer overflow-hidden opacity-60 hover:opacity-100 group-hover:opacity-100 relative bg-[var(--ag-sys-color-border)]"
                                    style={{ height: `${heightPercent}%`, minHeight: heightPercent === 0 ? '2px' : undefined }}
                                >
                                    {/* Stack 1: Perfiles Profesionales (AMBER) */}
                                    <div 
                                        className="w-full bg-amber-500 flex-shrink-0 transition-opacity" 
                                        style={{ height: `${subH}%` }} 
                                    />
                                    {/* Stack 2: Anuncios Destacados (PURPLE/PRIMARY) */}
                                    <div 
                                        className="w-full bg-purple-500 flex-shrink-0 transition-opacity" 
                                        style={{ height: `${featH}%` }} 
                                    />
                                </div>
                                
                                {/* Tooltip Flotante de Detalles Apilables */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-16 left-1/2 -translate-x-1/2 bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-surface)] text-[10px] font-bold px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg flex flex-col items-center">
                                    <div className="text-white mb-1">Total: {new Intl.NumberFormat('de-DE').format(total)} €</div>
                                    <div className="flex flex-col gap-0.5 mt-1 border-t border-[var(--ag-sys-color-border)]/20 pt-1">
                                        <span className="text-purple-300">Destacados: {new Intl.NumberFormat('de-DE').format(feat.value)} €</span>
                                        <span className="text-amber-300">Perfiles: {new Intl.NumberFormat('de-DE').format(sub.value)} €</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-[var(--ag-sys-color-text)] rotate-45 absolute -bottom-[3px]"></div>
                                </div>
                                
                                {/* Etiqueta tiempo */}
                                <span className="absolute -bottom-6 text-[10px] text-[var(--ag-sys-color-text-muted)] font-bold uppercase">{label}</span>
                            </div>
                        );
                    })}
                </div>
                
                {/* Leyenda Footer */}
                <div className="flex gap-6 mt-10 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-purple-500 opacity-60"></div>
                        <span className="text-xs font-bold text-[var(--ag-sys-color-text-muted)]">Anuncios Destacados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-amber-500 opacity-60"></div>
                        <span className="text-xs font-bold text-[var(--ag-sys-color-text-muted)]">Perfiles Profesionales</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
