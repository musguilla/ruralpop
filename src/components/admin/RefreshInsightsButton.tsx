"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export function RefreshInsightsButton({ lastUpdated }: { lastUpdated?: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRefresh = async () => {
        setLoading(true);
        setSuccess(false);
        setError(null);
        
        try {
            const res = await fetch('/api/admin/insights/refresh', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (data.success) {
                setSuccess(true);
                // Reload the page to show new data
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setError(data.error || "Error al generar datos");
            }
        } catch (err) {
            setError("Error de red al actualizar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleRefresh}
                disabled={loading || success}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                    success 
                        ? "bg-green-100 text-green-700" 
                        : "bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] shadow-sm hover:shadow-md"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : success ? (
                    <CheckCircle2 className="w-4 h-4" />
                ) : (
                    <RefreshCw className="w-4 h-4" />
                )}
                {loading ? "Generando datos (puede tardar minutos)..." : success ? "Actualizado" : "Generar Nuevos Datos"}
            </button>
            
            {error && (
                <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                    <AlertCircle className="w-3 h-3" /> {error}
                </div>
            )}
            
            {lastUpdated && !loading && !success && !error && (
                <div className="text-xs text-[var(--ag-sys-color-text-muted)] font-medium">
                    Última actualización: {new Date(lastUpdated).toLocaleString()}
                </div>
            )}
        </div>
    );
}
