import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";

export async function HomeStoreSection() {
    const supabase = await createClient();
    
    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

    if (!products || products.length === 0) {
        return null; // Silent skip if store is empty
    }

    return (
        <section className="my-16 pt-12 border-t border-[var(--ag-sys-color-border)]">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-8 flex items-center justify-center sm:justify-start gap-2">
                <span>🚜</span> Únete al estilo Ruralpop
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => (
                    <ProductCard 
                        key={product.id}
                        id={product.id}
                        slug={product.slug}
                        title={product.title}
                        price={product.price}
                        imageUrls={product.image_urls}
                    />
                ))}
            </div>
        </section>
    );
}
