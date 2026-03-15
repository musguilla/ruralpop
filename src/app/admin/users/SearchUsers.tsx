"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition, useCallback, useEffect, useState } from "react";

export function SearchUsers() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [value, setValue] = useState(searchParams.get("search") || "");

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
        <div className="relative w-full sm:w-80">
            <input
                type="text"
                placeholder="Buscar nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--ag-sys-color-border)] rounded-full text-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] placeholder-[var(--ag-sys-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-[var(--ag-sys-color-primary)]' : 'text-[var(--ag-sys-color-text-muted)]'}`} />
        </div>
    );
}
