import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import { ShoppingBag } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tienda Ruralpop | Productos Oficiales",
    description: "Compra productos exclusivos y gorras oficiales de Ruralpop. Estilo rural para el día a día.",
};

export default async function TiendaPage() {
    const supabase = await createClient();
    
    // Fetch products
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen pb-16">
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] mb-12">
                <div className="container mx-auto px-4 py-12 md:py-16 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]">
                            <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--ag-sys-color-text)]">
                            Tienda Ruralpop
                        </h1>
                    </div>
                    <p className="text-lg text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto">
                        Lleva el estilo rural allá donde vayas. Descubre nuestra colección exclusiva de gorras con los mejores diseños de campo.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {error || !products || products.length === 0 ? (
                    <div className="text-center py-20 text-[var(--ag-sys-color-text-muted)]">
                        <p>No se encontraron productos disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                )}
            </div>
        </div>
    );
}
