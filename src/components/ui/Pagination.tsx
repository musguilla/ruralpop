"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end === totalPages) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <Link
                    key={i}
                    href={createPageURL(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === i
                            ? "bg-[var(--ag-sys-color-primary)] text-white shadow-lg shadow-[var(--ag-sys-color-primary)]/25"
                            : "bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)]"
                        }`}
                >
                    {i}
                </Link>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12 py-8 pt-12 border-t border-[var(--ag-sys-color-border)]">
            {currentPage > 1 && (
                <Link
                    href={createPageURL(currentPage - 1)}
                    className="p-2.5 rounded-xl bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)] transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
            )}

            <div className="flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            {currentPage < totalPages && (
                <Link
                    href={createPageURL(currentPage + 1)}
                    className="p-2.5 rounded-xl bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)] transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            )}
        </div>
    );
}
