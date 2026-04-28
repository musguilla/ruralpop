import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { PriceTable } from '@/components/livestock/PriceTable';
import { ArrowLeft, GitCompare } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata(
    { params }: { params: Promise<{ categoria: string }> }
): Promise<Metadata> {
    const { categoria } = await params;
    const categoryName = categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
        title: `Comparativa de Precio: ${categoryName} | Ruralpop`,
        description: `Compara el precio de ${categoryName} en los diferentes mercados y lonjas de España.`
    };
}

export default async function CategoryComparisonPage({ params }: { params: Promise<{ categoria: string }> }) {
    const { categoria } = await params;
    const supabase = await createClient();

    // Convert url param to readable name for fallback
    const readableCategory = categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Fetch the latest price for this normalized category across all markets
    // We fetch recent ones and filter in JS
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 20); // give a bit more margin

    const { data: recentPrices } = await supabase
        .from('livestock_prices')
        .select('*, market_sources(name, region)')
        .eq('normalized_category', categoria)
        .gte('date', fifteenDaysAgo.toISOString())
        .order('date', { ascending: false });

    // Deduplicate to get only the latest snapshot per market
    const latestPricesMap = new Map();
    if (recentPrices) {
        for (const price of recentPrices) {
            if (!latestPricesMap.has(price.market_source_id)) {
                latestPricesMap.set(price.market_source_id, price);
            }
        }
    }
    const latestPrices = Array.from(latestPricesMap.values());

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12">
                
                <Link href="/precios-ganado/vacuno" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a todos los mercados
                </Link>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-xs uppercase tracking-widest mb-4">
                        <GitCompare className="w-4 h-4" />
                        Comparativa Nacional
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        {latestPrices[0]?.category_name || readableCategory}
                    </h1>
                    <p className="text-xl text-[var(--ag-sys-color-text-muted)] font-medium">
                        Comparativa de precios actualizados entre los diferentes mercados.
                    </p>
                </div>

                <div className="space-y-8">
                    <PriceTable prices={latestPrices} showMarketColumn={true} />
                </div>

            </div>
        </div>
    );
}
