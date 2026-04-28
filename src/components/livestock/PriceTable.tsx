"use client";

import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Search, Filter } from 'lucide-react';
import { LivestockPrice, MarketSource } from '@/types/livestock';

interface PriceTableProps {
    prices: (LivestockPrice & { market_sources?: Partial<MarketSource> })[];
    showMarketColumn?: boolean;
}

export function PriceTable({ prices, showMarketColumn = true }: PriceTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegment, setFilterSegment] = useState<string>('all');
    
    // Extracted unique segments for filter
    const segments = useMemo(() => {
        const set = new Set(prices.map(p => p.segment));
        return Array.from(set).sort();
    }, [prices]);

    const filteredPrices = useMemo(() => {
        return prices.filter(p => {
            const matchesSearch = p.category_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (showMarketColumn && p.market_sources?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesSegment = filterSegment === 'all' || p.segment === filterSegment;
            return matchesSearch && matchesSegment;
        });
    }, [prices, searchTerm, filterSegment, showMarketColumn]);

    // Grouping Logic: Segment -> Product -> Subcategory Items
    const groupedPrices = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};
        
        filteredPrices.forEach(price => {
            const seg = price.segment.toLowerCase();
            if (!groups[seg]) groups[seg] = {};
            
            let product = price.category_name;
            let subcategory = '';
            
            // Check if there is a ' - ' separator for grouping
            if (price.category_name.includes(' - ')) {
                const parts = price.category_name.split(' - ');
                product = parts[0].trim();
                subcategory = parts.slice(1).join(' - ').trim();
            }
            
            if (!groups[seg][product]) groups[seg][product] = [];
            groups[seg][product].push({
                ...price,
                display_name: subcategory || price.category_name
            });
        });
        
        return groups;
    }, [filteredPrices]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
            case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
            case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    const getTrendClass = (trend: string) => {
        switch (trend) {
            case 'up': return 'text-green-500 bg-green-500/10';
            case 'down': return 'text-red-500 bg-red-500/10';
            case 'stable': return 'text-gray-500 bg-gray-500/10';
            default: return 'text-[var(--ag-sys-color-text-muted)] bg-[var(--ag-sys-color-surface)]';
        }
    };

    const formatUnit = (unit: string) => {
        switch (unit) {
            case 'eur_unidad': return '€ / ud';
            case 'eur_kg_vivo': return '€ / kg vivo';
            case 'eur_kg_canal': return '€ / kg canal';
            case 'eur_arroba': return '€ / arroba';
            default: return '€';
        }
    };

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ag-sys-color-text-muted)]" />
                    <input 
                        type="text" 
                        placeholder="Buscar categoría o mercado..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-xl text-[var(--ag-sys-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 transition-shadow"
                    />
                </div>
                {segments.length > 0 && (
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ag-sys-color-text-muted)]" />
                        <select 
                            value={filterSegment}
                            onChange={(e) => setFilterSegment(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 appearance-none bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-xl text-[var(--ag-sys-color-text)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 transition-shadow cursor-pointer capitalize"
                        >
                            <option value="all">Filtros</option>
                            {segments.map(seg => (
                                <option key={seg} value={seg}>{seg}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--ag-sys-color-background)] border-b border-[var(--ag-sys-color-border)]">
                                {showMarketColumn && <th className="py-4 px-6 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Mercado</th>}
                                <th className="py-4 px-6 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Categoría</th>
                                <th className="py-4 px-6 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider text-right">Precio Medio</th>
                                <th className="py-4 px-6 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider text-right">Var.</th>
                                <th className="py-4 px-6 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                            {Object.keys(groupedPrices).length > 0 ? (
                                Object.entries(groupedPrices).sort(([a], [b]) => b.localeCompare(a)).map(([segment, products]) => (
                                    <React.Fragment key={segment}>
                                        {/* Segment Header Row */}
                                        <tr className="bg-[var(--ag-sys-color-background)]">
                                            <td colSpan={showMarketColumn ? 5 : 4} className="py-4 px-6">
                                                <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] tracking-tight capitalize">Bovino de {segment}</h3>
                                            </td>
                                        </tr>
                                        
                                        {Object.entries(products).sort(([a], [b]) => a.localeCompare(b)).map(([product, items]) => (
                                            <React.Fragment key={product}>
                                                {/* Product Group Header Row */}
                                                <tr className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)]/50">
                                                    <td colSpan={showMarketColumn ? 5 : 4} className="py-3 px-6">
                                                        <span className="text-sm font-bold text-[var(--ag-sys-color-primary)] uppercase tracking-wide">{product}</span>
                                                    </td>
                                                </tr>
                                                
                                                {/* Items */}
                                                {items.map((price, idx) => (
                                                    <tr key={price.id || idx} className="hover:bg-[var(--ag-sys-color-background)] transition-colors group">
                                                        {showMarketColumn && (
                                                            <td className="py-4 px-6">
                                                                <span className="font-semibold text-[var(--ag-sys-color-text)]">{price.market_sources?.name || 'Desconocido'}</span>
                                                            </td>
                                                        )}
                                                        <td className="py-4 px-6 pl-10">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[var(--ag-sys-color-text)]">{price.display_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-bold text-lg text-[var(--ag-sys-color-text)]">
                                                                    {price.price_avg.toFixed(2).replace('.', ',')}
                                                                </span>
                                                                <span className="text-[10px] uppercase font-bold text-[var(--ag-sys-color-text-muted)]">
                                                                    {formatUnit(price.unit)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${getTrendClass(price.trend)}`}>
                                                                {getTrendIcon(price.trend)}
                                                                {price.variation_abs ? Math.abs(price.variation_abs).toFixed(2).replace('.', ',') : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-text)] transition-colors">
                                                                {new Date(price.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={showMarketColumn ? 5 : 4} className="py-12 text-center text-[var(--ag-sys-color-text-muted)] font-medium">
                                        No se encontraron cotizaciones para tu búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory:
 * - Tabla robusta, responsiva (con `overflow-x-auto`) y utilizando colores del Design System (CSS Variables).
 * - Búsqueda optimizada por cliente usando `useMemo` con control de casing.
 */
