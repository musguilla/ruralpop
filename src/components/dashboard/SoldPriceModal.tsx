"use client";

import React, { useState } from "react";
import { X, Loader2, Euro } from "lucide-react";

interface SoldPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number) => Promise<void>;
}

export function SoldPriceModal({ isOpen, onClose, onConfirm }: SoldPriceModalProps) {
    const [priceStr, setPriceStr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) return;

        setIsSubmitting(true);
        try {
            await onConfirm(price);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--ag-sys-color-surface)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--ag-sys-color-border)] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-[var(--ag-sys-color-border)]">
                    <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)]">
                        Marcar como vendido
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-background)] rounded-full transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] mb-6">
                        Por favor, indica el precio final de venta. Solo lo usaremos para analizar el mercado y ofrecerte mejores resultados o recomendaciones en el futuro.
                    </p>

                    <div className="mb-8 relative">
                        <label htmlFor="sold_price" className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">
                            Precio final de venta
                        </label>
                        <div className="relative">
                            <input
                                id="sold_price"
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={priceStr}
                                onChange={(e) => setPriceStr(e.target.value)}
                                className="w-full h-14 pl-4 pr-12 text-lg font-bold bg-[var(--ag-sys-color-background)] border-2 border-[var(--ag-sys-color-border)] rounded-2xl focus:border-[var(--ag-sys-color-primary)] focus:ring-4 focus:ring-[var(--ag-sys-color-primary)]/10 outline-none transition-all"
                                placeholder="Ej. 1500"
                                disabled={isSubmitting}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ag-sys-color-text-muted)]">
                                <Euro className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 font-bold text-[var(--ag-sys-color-text)] bg-[var(--ag-sys-color-background)] rounded-xl hover:bg-[var(--ag-sys-color-border)] transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{ backgroundColor: 'var(--ag-sys-color-primary)', color: 'white' }}
                            className="flex-1 py-4 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center"
                            disabled={isSubmitting || !priceStr}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Venta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa en componente propio para mantener DashboardListingActions limpio.
 * - Incluye texto solicitado sobre "analizar el mercado".
 * - "Zero Errors" design con validación local e isSubmitting.
 */
