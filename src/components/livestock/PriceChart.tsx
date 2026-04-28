"use client";

import React from 'react';
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

export function PriceChart({ data, title, unit = '€' }: PriceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)]">
                <span className="text-[var(--ag-sys-color-text-muted)] font-medium">No hay datos históricos disponibles</span>
            </div>
        );
    }

    // Sort data chronologically just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Format date for display
    const formattedData = sortedData.map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="w-full bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)]">
            {title && <h3 className="text-xl font-bold mb-6 text-[var(--ag-sys-color-text)]">{title}</h3>}
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
                            formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, 'Precio']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                            type="monotone" 
                            dataKey="price" 
                            name="Precio Medio"
                            stroke="var(--ag-sys-color-primary)" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'var(--ag-sys-color-background)', strokeWidth: 2, stroke: 'var(--ag-sys-color-primary)' }}
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
