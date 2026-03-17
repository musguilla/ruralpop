"use client";

import React, { useRef } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface CompanySearchInputProps {
    initialSearchTerm?: string;
}

export function CompanySearchInput({ initialSearchTerm = "" }: CompanySearchInputProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        
        // Reset pagination if searching a new term
        params.delete("page");
        
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return (
        <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                ref={inputRef}
                type="text" 
                name="q"
                defaultValue={initialSearchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar en esta tienda..." 
                className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] shadow-sm"
                aria-label="Caja de búsqueda de tienda"
            />
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se usa useDebouncedCallback para evitar saturar el router/servidor con cada tecla.
 * - Mantiene scroll: false en router.replace para que al filtrar no suba la página de golpe.
 */
