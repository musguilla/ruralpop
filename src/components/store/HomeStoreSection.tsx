import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreSlider } from "@/components/store/StoreSlider";

export async function HomeStoreSection() {
    const supabase = await createClient();
    
    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (!products || products.length === 0) {
        return null; // Silent skip if store is empty
    }

    return <StoreSlider products={products} />;
}
