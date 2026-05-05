"use client";

import React from 'react';

export function ScrollToCheckoutButton() {
    const handleScroll = () => {
        const checkoutFlow = document.getElementById("escrow-checkout-flow");
        if (checkoutFlow) {
            checkoutFlow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Wait for smooth scroll, then click the start checkout button
            setTimeout(() => {
                const startBtn = checkoutFlow.querySelector('[data-action="start-checkout"]') as HTMLButtonElement;
                if (startBtn && !startBtn.disabled) {
                    startBtn.click();
                }
            }, 500);
        }
    };

    return (
        <button
            onClick={handleScroll}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20 active:scale-95"
        >
            Comprar
        </button>
    );
}
