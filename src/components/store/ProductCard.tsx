import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrls: string[];
}

export function ProductCard({ id, slug, title, price, imageUrls }: ProductCardProps) {
  const mainImage = imageUrls[0] || '/default-og.jpg';
  const hoverImage = imageUrls[1] || mainImage; // If no second image, fallback to first

  return (
    <Link href={`/tienda/${slug}`} className="group block bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--ag-sys-color-background)]">
        {/* Main Image */}
        <Image 
          src={mainImage} 
          alt={title} 
          fill 
          className="object-cover transition-opacity duration-500 opacity-100 group-hover:opacity-0" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Hover Image */}
        <Image 
          src={hoverImage} 
          alt={`${title} alternate view`} 
          fill 
          className="object-cover absolute top-0 left-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-5 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-2 group-hover:text-[var(--ag-sys-color-primary)] transition-colors line-clamp-1">{title}</h3>
        <span className="text-xl font-extrabold text-[var(--ag-sys-color-primary)]">{price.toFixed(2)}€</span>
      </div>
    </Link>
  );
}
