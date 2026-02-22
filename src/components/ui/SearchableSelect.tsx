"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Option {
    id: number | string;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: number | string | "";
    onChange: (value: number | string | "") => void;
    placeholder: string;
    searchPlaceholder?: string;
    label?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    isLoading?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder = "Buscar...",
    label,
    name,
    disabled = false,
    required = false,
    isLoading = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtered options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const term = searchTerm.toLowerCase().trim();
        return options.filter(opt => opt.name.toLowerCase().includes(term));
    }, [options, searchTerm]);

    // Get selected option label
    const selectedOption = useMemo(() => {
        return options.find(opt => opt.id === value);
    }, [options, value]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled && !isLoading) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
        }
    };

    const handleSelect = (option: Option) => {
        onChange(option.id);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={value} required={required} />

            <div
                className={`
                    w-full px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-[var(--ag-sys-color-background)]'}
                    ${isOpen ? 'border-[var(--ag-sys-color-primary)] ring-2 ring-[var(--ag-sys-color-primary)]/10' : 'border-[var(--ag-sys-color-border)]'}
                    hover:border-[var(--ag-sys-color-primary)]
                `}
                onClick={handleToggle}
            >
                <span className={`truncate flex-1 ${!selectedOption ? 'text-gray-400' : 'text-[var(--ag-sys-color-text)]'}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                    {value !== "" && !disabled && (
                        <X
                            className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-[var(--ag-sys-color-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top">
                    <div className="p-3 border-b border-[var(--ag-sys-color-border)] sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[var(--ag-sys-color-border)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-[var(--ag-sys-color-primary)]" />
                                Cargando opciones...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    className={`
                                        px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors
                                        ${opt.id === value ? 'bg-[var(--ag-sys-color-primary)]/5 text-[var(--ag-sys-color-primary)] font-medium' : 'text-[var(--ag-sys-color-text)] hover:bg-gray-50'}
                                    `}
                                    onClick={() => handleSelect(opt)}
                                >
                                    <span className="truncate">{opt.name}</span>
                                    {opt.id === value && <Check className="w-4 h-4 shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500 italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
