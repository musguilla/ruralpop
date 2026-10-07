"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useTransition, useCallback, useEffect, useState } from "react";

export function SearchUsers() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentCountry = searchParams.get("country") || "";
    const [value, setValue] = useState(searchParams.get("search") || "");

    const handleCountryChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        if (val) {
            params.set("country", val);
        } else {
            params.delete("country");
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        const prevSearch = params.get("search");
        
        if (term === prevSearch || (!term && !prevSearch)) return;

        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        params.delete("page"); // reset page to 1
        
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(value);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [value, handleSearch]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
            {/* Selector de país */}
            <div className="relative w-full sm:w-auto">
                <select
                    value={currentCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm outline-none focus:border-[var(--ag-sys-color-primary)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/10 font-bold text-[var(--ag-sys-color-text)] shadow-sm hover:shadow-md cursor-pointer appearance-none transition-all"
                >
                    <option value="">🌍 Todos (ES + PT)</option>
                    <option value="es">🇪🇸 España</option>
                    <option value="pt">🇵🇹 Portugal</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-sys-color-text-muted)] pointer-events-none" />
            </div>

            {/* Input de búsqueda */}
            <div className="relative w-full sm:w-80">
                <input
                    type="text"
                    placeholder="Buscar nombre, email o teléfono..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--ag-sys-color-border)] rounded-full text-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] placeholder-[var(--ag-sys-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all shadow-sm hover:shadow-md font-medium placeholder:font-normal placeholder:opacity-60"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-[var(--ag-sys-color-primary)]' : 'text-[var(--ag-sys-color-text-muted)]'}`} />
            </div>
        </div>
    );
}
