'use client';

import React, { useState } from 'react';
import { MarketSource } from '@/types/livestock';
import { Play, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LonjasClientProps {
    sources: MarketSource[];
}

export function LonjasClient({ sources }: LonjasClientProps) {
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [globalLoading, setGlobalLoading] = useState(false);

    const router = useRouter();

    const handleRun = async (id?: string) => {
        if (id) {
            setLoadingIds(prev => new Set(prev).add(id));
        } else {
            setGlobalLoading(true);
        }

        try {
            const response = await fetch('/api/admin/etl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceId: id })
            });
            const result = await response.json();
            
            if (!result.success) {
                alert(`Hubo un error al procesar: ${result.error}`);
            }
            router.refresh(); // Force Next.js to re-fetch Server Components (update table timestamps)
        } catch (error) {
            console.error(error);
            alert('Error crítico de red al contactar con el servidor.');
        } finally {
            if (id) {
                setLoadingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            } else {
                setGlobalLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">Lonjas y Mercados (ETL)</h1>
                    <p className="text-sm text-[var(--ag-sys-color-text-muted)]">
                        Gestiona las fuentes de datos de cotizaciones y fuerza su sincronización.
                    </p>
                </div>
                <button
                    onClick={() => handleRun()}
                    disabled={globalLoading || loadingIds.size > 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ag-sys-color-primary)] text-white font-medium rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] disabled:opacity-50 transition-all shadow-sm"
                >
                    {globalLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                    Actualizar Todos
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-[var(--ag-sys-color-text-muted)] font-medium border-b border-[var(--ag-sys-color-border)]">
                            <tr>
                                <th className="px-6 py-4">Mercado</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Último Éxito</th>
                                <th className="px-6 py-4">Último Error</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                            {sources.map((source) => (
                                <tr key={source.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--ag-sys-color-text)] flex items-center gap-2">
                                                {source.name}
                                                {!source.active && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-700 rounded-full font-bold uppercase tracking-wider">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)] mt-1">
                                                {source.province}, {source.region}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md uppercase tracking-wider">
                                            {source.source_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {source.last_success_at ? (
                                            <div className="flex items-center gap-2 text-green-700">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>{new Date(source.last_success_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {source.last_error_at ? (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{new Date(source.last_error_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRun(source.id)}
                                            disabled={loadingIds.has(source.id) || globalLoading || !source.active}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-xs"
                                        >
                                            {loadingIds.has(source.id) ? (
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--ag-sys-color-primary)]" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5 text-gray-500" />
                                            )}
                                            Importar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Componente de cliente interactivo para permitir forzar importaciones individuales sin bloquear UI.
 * - Usamos iconos y formato de fecha relacional para mejor UX.
 */
