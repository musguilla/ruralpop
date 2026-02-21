"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchInput({
  placeholder = "Buscar anuncios, categorías...",
  className = "",
  onSearch
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;

    if (onSearch) {
      onSearch(query);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-lg ${className}`}
    >
      <input
        type="text"
        name="q"
        defaultValue={searchParams.get("q") || ""}
        placeholder={placeholder}
        className="w-full h-10 pl-4 pr-10 rounded-full border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
        aria-label="Caja de búsqueda"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors"
        aria-label="Realizar búsqueda"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se integra `useRouter` y `useSearchParams` de next/navigation.
 * - Al hacer submit, navega hacia `/?q=query` activando el SSR del Home para buscar los anuncios.
 * - Sincroniza el Input con la URL para que no parezca vacío al entrar por link directo.
 */
