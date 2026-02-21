"use client";

import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Buscar anuncios, categorías...",
  onSearch,
  className = "",
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(query);
      }
    },
    [onSearch, query]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-lg ${className}`}
    >
      <input
        type="text"
        value={query}
        onChange={handleChange}
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
 * - Se usa 'use client' porque maneja el estado del input (`query`).
 * - Se prefiere un HTML form nativo para manejar submit con la tecla 'Enter' fácilmente.
 * - Soporte de accesibilidad (aria-label).
 * - Uso exclusivo de tokens CSS a través de variables var(--ag-sys-color-...) para estilos.
 * - useCallback para optimizar pasajes de funciones si este componente se vuelve pesado en el DOM.
 */
