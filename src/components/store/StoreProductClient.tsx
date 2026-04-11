'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { Minus, Plus, ShoppingCart, Check, X, Ruler } from 'lucide-react';
import Image from 'next/image';

interface StoreProductClientProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    imageUrls: string[];
    description: string | null;
  };
}

export function StoreProductClient({ product }: StoreProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  
  const { addItem } = useCartStore();

  const isTshirt = product.slug.includes('camiseta');

  const handleAddToCart = () => {
    if (isTshirt && !size) {
        alert('Por favor, selecciona una talla antes de añadir a la cesta.');
        return;
    }

    addItem({
      id: isTshirt ? `${product.id}-${size}` : product.id,
      slug: product.slug,
      title: isTshirt ? `${product.title} (Talla ${size})` : product.title,
      price: product.price,
      imageUrl: product.imageUrls[0],
      quantity,
      size: size || undefined
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Columna Galería */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)]">
          <Image 
            src={product.imageUrls[activeImageIndex] || '/default-og.jpg'}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Miniaturas */}
        {product.imageUrls.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {product.imageUrls.map((url, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[var(--ag-sys-color-primary)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <Image src={url} alt={`${product.title} vista ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Columna Info y Compra */}
      <div className="lg:col-span-5 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">{product.title}</h1>
        <p className="text-3xl font-extrabold text-[var(--ag-sys-color-primary)] mb-6">{product.price.toFixed(2)}€</p>
        
        <div className="prose prose-sm md:prose-base dark:prose-invert text-[var(--ag-sys-color-text)] mb-8">
          <p>{product.description}</p>
        </div>

        <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 mt-auto">
          
          {/* Tallas */}
          {isTshirt ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-[var(--ag-sys-color-text)]">Talla</span>
                  <button 
                    onClick={() => setIsSizeModalOpen(true)}
                    className="text-sm text-[var(--ag-sys-color-primary)] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-4 h-4" /> Guía de tallas
                  </button>
              </div>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 flex items-center justify-center font-bold rounded-xl border-2 transition-all ${size === s ? 'border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/10' : 'border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:border-[var(--ag-sys-color-primary)]/50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-md text-sm font-semibold text-[var(--ag-sys-color-text-muted)]">
                    Talla única
                </span>
            </div>
          )}

          <div className="flex items-center gap-6 mb-6">
            <span className="font-semibold text-[var(--ag-sys-color-text)]">Cantidad</span>
            <div className="flex items-center border border-[var(--ag-sys-color-border)] rounded-xl bg-[var(--ag-sys-color-background)]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all ${added ? 'bg-green-500 text-white' : 'bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] text-white'}`}
          >
            {added ? (
              <>
                <Check className="w-6 h-6" /> Añadido a la cesta
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6" /> Añadir a la cesta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Guía de Tallas */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeModalOpen(false)}>
            <div 
                className="relative bg-[var(--ag-sys-color-background)] rounded-2xl max-w-2xl w-full p-2 overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-end p-2 absolute right-0 top-0 z-10 w-full bg-gradient-to-b from-black/50 to-transparent">
                    <button 
                        onClick={() => setIsSizeModalOpen(false)}
                        className="bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors backdrop-blur-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="relative w-full h-[60vh] md:h-[70vh]">
                    <Image 
                        src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/tallas-camisetas.jpg" 
                        alt="Guía de tallas" 
                        fill 
                        className="object-contain rounded-xl"
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
