"use client";

import React, { useState } from "react";
import { Eye, Trash2, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteListing, toggleListingStatus } from "@/app/dashboard/actions";

interface DashboardListingActionsProps {
    listingId: string;
    status: string;
}

export function DashboardListingActions({ listingId, status }: DashboardListingActionsProps) {
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.")) return;

        setIsPending(true);
        try {
            await deleteListing(listingId);
        } catch (err) {
            alert("Error al eliminar el anuncio");
            setIsPending(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsPending(true);
        try {
            await toggleListingStatus(listingId, status);
            setIsPending(false);
        } catch (err) {
            alert("Error al actualizar el estado");
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--ag-sys-color-border)]">
            <div className="flex gap-2">
                <Link
                    href={`/listing/${listingId}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] font-semibold rounded-xl hover:bg-[var(--ag-sys-color-border)] transition-all text-sm"
                >
                    <Eye className="w-4 h-4" />
                    Ver
                </Link>

                <button
                    onClick={handleToggleStatus}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all text-sm disabled:opacity-50 ${status === 'active'
                            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                            : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {status === 'active' ? 'Marcar Vendido' : 'Reactivar'}
                </button>
            </div>

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500/20 transition-all text-sm disabled:opacity-50"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar
            </button>
        </div>
    );
}
