import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { PriceChart } from '@/components/livestock/PriceChart';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata(
    { params }: { params: Promise<{ mercado: string, categoria: string }> }
): Promise<Metadata> {
    const { mercado, categoria } = await params;
    const supabase = await createClient();
    
    const { data } = await supabase
        .from('market_sources')
        .select('name')
        .eq('id', mercado)
        .single();
        
    if (!data) return { title: 'No encontrado' };
    
    // Convert url param to readable name
    const categoryName = categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
        title: `Precio Histórico de ${categoryName} en ${data.name} | Ruralpop`,
        description: `Evolución del precio de ${categoryName} en el mercado de ganado de ${data.name}. Consulta gráficas históricas y variaciones semanales.`
    };
}

export default async function MarketCategoryDetailPage({ params }: { params: Promise<{ mercado: string, categoria: string }> }) {
    const { mercado, categoria } = await params;
    const supabase = await createClient();

    const { data: market } = await supabase
        .from('market_sources')
        .select('*')
        .eq('id', mercado)
        .single();

    if (!market) {
        notFound();
    }

    // Fetch all prices for this category in this market ordered chronologically
    const { data: prices } = await supabase
        .from('livestock_prices')
        .select('*')
        .eq('market_source_id', mercado)
        .eq('normalized_category', categoria)
        .order('date', { ascending: true }); // Ascending for the chart

    if (!prices || prices.length === 0) {
        // Fallback if the normalized category doesn't strictly match but exists
        // Might happen if normalization rules changed
        notFound();
    }

    const latestPrice = prices[prices.length - 1];
    const previousPrice = prices.length > 1 ? prices[prices.length - 2] : null;
    
    const chartData = prices.map((p: any) => ({
        date: p.date,
        price: p.price_avg
    }));

    // Calculate variation
    let varAbs = 0;
    let varPct = 0;
    let trend = 'stable';
    
    if (previousPrice) {
        varAbs = latestPrice.price_avg - previousPrice.price_avg;
        varPct = (varAbs / previousPrice.price_avg) * 100;
        if (varAbs > 0) trend = 'up';
        else if (varAbs < 0) trend = 'down';
    }

    const formatUnit = (unit: string) => {
        switch (unit) {
            case 'eur_unidad': return '€ / unidad';
            case 'eur_kg_vivo': return '€ / kg vivo';
            case 'eur_kg_canal': return '€ / kg canal';
            case 'eur_arroba': return '€ / arroba';
            default: return '€';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] w-full">
            <div className="container mx-auto w-full px-4 md:px-6 lg:px-8 py-12">
                
                <Link href={`/precios-ganado/vacuno/mercados/${mercado}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a {market.name}
                </Link>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] font-bold text-xs uppercase tracking-widest mb-4">
                        {latestPrice.segment}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        {latestPrice.category_name}
                    </h1>
                    <p className="text-xl text-[var(--ag-sys-color-text-muted)] font-medium">
                        en {market.name}
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6">
                        <span className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider block mb-2">Precio Actual</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[var(--ag-sys-color-text)]">{latestPrice.price_avg.toFixed(2).replace('.', ',')}</span>
                            <span className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase">{formatUnit(latestPrice.unit)}</span>
                        </div>
                        <span className="text-xs text-[var(--ag-sys-color-text-muted)] block mt-2">
                            A fecha {new Date(latestPrice.date).toLocaleDateString('es-ES')}
                        </span>
                    </div>

                    <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6">
                        <span className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider block mb-2">Variación (vs ant.)</span>
                        <div className={`flex items-center gap-2 text-2xl font-black ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                            {trend === 'up' && <TrendingUp className="w-6 h-6" />}
                            {trend === 'down' && <TrendingDown className="w-6 h-6" />}
                            {trend === 'stable' && <Minus className="w-6 h-6" />}
                            {varAbs > 0 ? '+' : ''}{varAbs.toFixed(2).replace('.', ',')} {formatUnit(latestPrice.unit).split('/')[0].trim()}
                        </div>
                        <span className="text-xs font-bold mt-2 block opacity-80" style={{ color: 'inherit' }}>
                            {varPct > 0 ? '+' : ''}{varPct.toFixed(2).replace('.', ',')}%
                        </span>
                    </div>
                </div>

                {/* Chart */}
                <div className="mb-16">
                    <PriceChart 
                        data={chartData} 
                        title={`Evolución Histórica (${latestPrice.category_name})`} 
                        unit={formatUnit(latestPrice.unit)}
                    />
                </div>

                {/* SEO & FAQ Block */}
                <div className="bg-[var(--ag-sys-color-primary)]/5 border border-[var(--ag-sys-color-primary)]/20 rounded-3xl p-8 md:p-12">
                    <div className="flex items-start gap-4">
                        <div className="bg-[var(--ag-sys-color-primary)]/20 p-3 rounded-full text-[var(--ag-sys-color-primary)] hidden md:block">
                            <Info className="w-6 h-6" />
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--ag-sys-color-text)]">
                            <h3 className="text-xl font-bold mt-0 mb-4 text-[var(--ag-sys-color-text)]">Información sobre este precio</h3>
                            <p>
                                El precio mostrado para <strong>{latestPrice.category_name}</strong> ha sido extraído automáticamente del documento oficial de cotizaciones publicado por <strong>{market.name}</strong>.
                            </p>
                            <p>
                                Los precios de <strong>{latestPrice.segment}</strong> se miden en <strong>{formatUnit(latestPrice.unit)}</strong>. Las variaciones reflejan la diferencia exacta reportada entre la sesión mostrada y la sesión inmediatamente anterior registrada en nuestra base de datos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
