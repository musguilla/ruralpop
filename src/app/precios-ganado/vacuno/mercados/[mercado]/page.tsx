import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { PriceTable } from '@/components/livestock/PriceTable';
import { MapPin, Globe, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata(
    { params }: { params: Promise<{ mercado: string }> }
): Promise<Metadata> {
    const { mercado } = await params;
    const supabase = await createClient();
    
    const { data } = await supabase
        .from('market_sources')
        .select('name, region')
        .eq('id', mercado)
        .single();
        
    if (!data) return { title: 'Mercado no encontrado' };
    
    return {
        title: `Precios y Cotizaciones: ${data.name} | Ruralpop`,
        description: `Consulta las cotizaciones históricas y actuales de ganado vacuno en ${data.name} (${data.region}).`
    };
}

export default async function MarketDetailPage({ params }: { params: Promise<{ mercado: string }> }) {
    const { mercado } = await params;
    const supabase = await createClient();

    const { data: market } = await supabase
        .from('market_sources')
        .select('*')
        .eq('id', mercado)
        .single();

    if (!market) {
        notFound();
    }

    // Fetch latest prices for this market
    const { data: recentPrices } = await supabase
        .from('livestock_prices')
        .select('*')
        .eq('market_source_id', mercado)
        .order('date', { ascending: false })
        .limit(200);

    // Filter to get only the latest date per category
    const latestPricesMap = new Map();
    if (recentPrices) {
        for (const price of recentPrices) {
            if (!latestPricesMap.has(price.category_name)) {
                latestPricesMap.set(price.category_name, price);
            }
        }
    }
    const latestPrices = Array.from(latestPricesMap.values());

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
                
                <Link href="/precios-ganado/vacuno" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a todos los mercados
                </Link>

                <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl p-8 md:p-12 mb-12 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-xs uppercase tracking-widest mb-4">
                                Lonja Oficial
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                                {market.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-[var(--ag-sys-color-text-muted)] font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {market.province}, {market.region}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    <a href={market.source_url} target="_blank" rel="nofollow noopener noreferrer" className="hover:text-[var(--ag-sys-color-primary)] transition-colors underline underline-offset-4">
                                        Fuente original
                                    </a>
                                </div>
                                {market.last_success_at && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Última sincronización: {new Date(market.last_success_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">Últimas Cotizaciones Publicadas</h2>
                    <PriceTable prices={latestPrices} showMarketColumn={false} />
                </div>
                


            </div>
        </div>
    );
}
