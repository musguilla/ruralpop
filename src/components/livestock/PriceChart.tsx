"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
    date: string; // ISO String or short date
    price: number;
}

interface PriceChartProps {
    data: ChartDataPoint[];
    title?: string;
    unit?: string;
}

type AggregationMode = 'dias' | 'semanas' | 'meses';

function getWeekKey(d: Date) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${weekNumber}`;
}

export function PriceChart({ data, title, unit = '€' }: PriceChartProps) {
    const [mode, setMode] = useState<AggregationMode>('semanas');

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)]">
                <span className="text-[var(--ag-sys-color-text-muted)] font-medium">No hay datos históricos disponibles</span>
            </div>
        );
    }

    const aggregatedData = useMemo(() => {
        const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (mode === 'dias') return sortedData;

        const map = new Map<string, { sum: number; count: number; date: string }>();
        
        sortedData.forEach(d => {
            const date = new Date(d.date);
            let key = '';
            
            if (mode === 'meses') {
                key = `${date.getFullYear()}-${date.getMonth()}`;
            } else if (mode === 'semanas') {
                key = getWeekKey(date);
            }
            
            if (!map.has(key)) {
                map.set(key, { sum: 0, count: 0, date: d.date });
            }
            const entry = map.get(key)!;
            entry.sum += d.price;
            entry.count += 1;
        });
        
        return Array.from(map.values()).map(v => ({
            date: v.date,
            price: v.sum / v.count
        }));
    }, [data, mode]);

    // Format date for display including year to avoid Recharts categorical axis overlaps across years
    const formattedData = aggregatedData.map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString('es-ES', { year: '2-digit', month: 'short', day: 'numeric' })
    }));

    return (
        <div className="w-full bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {title && <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">{title}</h3>}
                
                <div className="flex items-center gap-1 bg-[var(--ag-sys-color-background)] p-1 rounded-xl border border-[var(--ag-sys-color-border)]">
                    {(['dias', 'semanas', 'meses'] as AggregationMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                                mode === m 
                                    ? 'bg-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-background)] shadow-sm' 
                                    : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface)]'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ag-sys-color-border)" opacity={0.5} />
                        <XAxis 
                            dataKey="displayDate" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--ag-sys-color-text-muted)', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--ag-sys-color-text-muted)', fontSize: 12, fontWeight: 500 }}
                            tickFormatter={(value) => `${value}${unit}`}
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--ag-sys-color-background)',
                                border: '1px solid var(--ag-sys-color-border)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                color: 'var(--ag-sys-color-text)',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: 'var(--ag-sys-color-primary)' }}
                            formatter={(value: any) => [`${Number(value).toFixed(2)} ${unit}`, 'Precio']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                            type="monotone" 
                            dataKey="price" 
                            name="Precio Medio"
                            stroke="var(--ag-sys-color-primary)" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: 'var(--ag-sys-color-primary)', stroke: 'var(--ag-sys-color-background)', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * Memory:
 * - Se ha utilizado `recharts` para un line chart responsive siguiendo el estilo estricto de Antigravity.
 * - Los colores de los ejes y tooltips usan variables CSS globales `var(--ag-sys-...)`.
 */
