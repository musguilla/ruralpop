'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBasket, X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { items, getCartCount, getCartTotal, removeItem, updateQuantity } = useCartStore();
  const count = getCartCount();
  const total = getCartTotal();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Avoid hydration mismatch by waiting for mount or just checking length
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || count === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full relative"
        aria-label="Cesta de Compra"
      >
        <ShoppingBasket className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[var(--ag-sys-color-primary)] rounded-full">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] shadow-xl rounded-2xl overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="p-4 border-b border-[var(--ag-sys-color-border)] flex justify-between items-center bg-[var(--ag-sys-color-background)]">
            <h3 className="font-bold text-[var(--ag-sys-color-text)]">Cesta {count > 0 && `(${count})`}</h3>
            <button onClick={() => setIsOpen(false)} className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="text-center py-6 text-[var(--ag-sys-color-text-muted)]">
                <ShoppingBasket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Tu cesta está vacía</p>
                <Link 
                  href="/tienda" 
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--ag-sys-color-primary)] font-semibold mt-2 inline-block hover:underline"
                >
                  Ir a la Tienda
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--ag-sys-color-border)] flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--ag-sys-color-text)] line-clamp-1">{item.title}</h4>
                    <p className="text-sm font-semibold text-[var(--ag-sys-color-primary)]">{(item.price * item.quantity).toFixed(2)}€</p>
                    
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center border border-[var(--ag-sys-color-border)] rounded-md">
                         <button 
                             onClick={() => updateQuantity(item.id, item.quantity - 1)}
                             className="p-1 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                         >
                           <Minus className="w-3 h-3" />
                         </button>
                         <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                         <button 
                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
                             className="p-1 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                         >
                           <Plus className="w-3 h-3" />
                         </button>
                      </div>
                      <button 
                         onClick={() => removeItem(item.id)}
                         className="text-xs text-red-500 hover:text-red-600 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-[var(--ag-sys-color-text-muted)]">Subtotal</span>
                <span className="font-bold text-xl text-[var(--ag-sys-color-text)]">{total.toFixed(2)}€</span>
              </div>
              
              <Link 
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full flex justify-center items-center py-3 px-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors"
              >
                Finalizar Compra
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
