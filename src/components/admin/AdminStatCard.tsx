"use client";

import React, { useState } from "react";

export type HistogramData = { value: number; tooltip: string };
export type Histograms = { days: HistogramData[]; weeks: HistogramData[]; months: HistogramData[] };

export function AdminStatCard({
    label,
    value,
    icon,
    color,
    histograms,
    showFilters,
    subtext,
    href,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    histograms?: Histograms;
    showFilters?: boolean;
    subtext?: React.ReactNode;
    href?: string;
}) {
    const [filter, setFilter] = useState<'days' | 'weeks' | 'months'>('days');

    const colorMap = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500', activeFilter: 'bg-blue-500 text-white' },
        green: { bg: 'bg-green-500/10', text: 'text-green-500', fill: 'bg-green-500', activeFilter: 'bg-green-500 text-white' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500', activeFilter: 'bg-purple-500 text-white' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', fill: 'bg-amber-500', activeFilter: 'bg-amber-500 text-white' },
    };
    const colorClasses = colorMap[color as keyof typeof colorMap] || colorMap.blue;

    const chartData = histograms ? histograms[filter] : null;

    return (
        <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-lg hover:shadow-[var(--ag-sys-color-primary)]/5 transition-all flex flex-col h-full">

            {/* Header: Icono a la Izquierda y Titulo+Numero a la Derecha */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${colorClasses.bg} ${colorClasses.text}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] mb-1 leading-none">{label}</p>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-3xl font-black text-[var(--ag-sys-color-text)] leading-none">{value}</h4>
                        {subtext && <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] leading-none">{subtext}</span>}
                    </div>
                </div>
            </div>

            {/* Area Inferior: Graficos y Filtros */}
            <div className="mt-auto pt-4 border-t border-[var(--ag-sys-color-border)] flex flex-col gap-4 flex-1 justify-end">

                {(showFilters || href) && (
                    <div className="flex justify-between items-center -mx-1">
                        <div className="flex gap-1.5">
                            {showFilters && (
                                <>
                                    <button
                                        onClick={() => setFilter('days')}
                                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'days' ? colorClasses.activeFilter : 'bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                                    >
                                        Días
                                    </button>
                                    <button
                                        onClick={() => setFilter('weeks')}
                                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'weeks' ? colorClasses.activeFilter : 'bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                                    >
                                        Semanas
                                    </button>
                                    <button
                                        onClick={() => setFilter('months')}
                                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors ${filter === 'months' ? colorClasses.activeFilter : 'bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-surface)]'}`}
                                    >
                                        Meses
                                    </button>
                                </>
                            )}
                        </div>
                        {href && (
                            <a 
                                href={href}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${colorClasses.text} hover:underline ml-auto flex items-center gap-1`}
                            >
                                Ver más <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        )}
                    </div>
                )}

                {chartData && (
                    <div className="h-16 flex items-end justify-between gap-[2px] w-full pt-2">
                        {chartData.map((hObj, i) => {
                            const maxVal = Math.max(...chartData.map(d => d.value));
                            const h = hObj.value;
                            // Avoid division by zero if all values are 0
                            const heightPercentage = maxVal > 0 ? (h / maxVal) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 w-full relative group h-full flex items-end">
                                    <div
                                        className={`w-full rounded-t-sm transition-all cursor-pointer opacity-40 group-hover:opacity-100 relative ${colorClasses.fill}`}
                                        style={{ height: `${heightPercentage}%`, minHeight: heightPercentage === 0 ? '2px' : undefined }}
                                    >
                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-9 left-1/2 -translate-x-1/2 bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-surface)] text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg flex flex-col items-center">
                                            {hObj.tooltip}
                                            <div className="w-1.5 h-1.5 bg-[var(--ag-sys-color-text)] rotate-45 absolute -bottom-[3px]"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Refactorizado StatCard para ser un componente de Cliente (para manejar el filtro Days/Weeks/Months).
 * - Se elimina todo rastro del texto de % increment y customDemoContent para homogeneizar las 4 cartas en altura.
 */
