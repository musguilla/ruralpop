import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { PriceTable } from '@/components/livestock/PriceTable';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
    title: 'Precios de Mercado de Ganado Bovino en España | Ruralpop',
    description: 'Consulta las últimas cotizaciones, tendencias y gráficos históricos de los principales mercados y lonjas de ganado bovino en España (Salamanca, Siero, Santiago, Talavera, León).',
};

export default async function BovinePricesHubPage() {
    const supabase = await createClient();

    // 1. Fetch Active Markets
    const { data: markets } = await supabase
        .from('market_sources')
        .select('*')
        .eq('active', true);

    // 2. Fetch Latest Prices for each active market (getting the max date per market)
    // For simplicity without a complex SQL query, we can fetch all from the last 15 days 
    // and filter the latest date per market in JS.
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const { data: recentPrices } = await supabase
        .from('livestock_prices')
        .select('*, market_sources(name, region)')
        .gte('date', fifteenDaysAgo.toISOString())
        .order('date', { ascending: false });

    // Deduplicate to get only the latest snapshot per market + category combination
    const latestPricesMap = new Map();
    if (recentPrices) {
        for (const price of recentPrices) {
            const key = `${price.market_source_id}-${price.category_name}`;
            if (!latestPricesMap.has(key)) {
                latestPricesMap.set(key, price);
            }
        }
    }
    const latestPrices = Array.from(latestPricesMap.values());

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            {/* Hero Section */}
            <section className="relative w-full pt-32 pb-20 px-4 md:px-6 lg:px-8 border-b border-[var(--ag-sys-color-border)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--ag-sys-color-primary)]/10 to-transparent pointer-events-none"></div>
                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-xs uppercase tracking-widest mb-6">
                        <TrendingUp className="w-4 h-4" />
                        <span>Cotizaciones Nacionales</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-6">
                        Precios de Mercado de <span className="text-[var(--ag-sys-color-primary)]">Ganado Bovino</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text-muted)] max-w-3xl leading-relaxed">
                        Sistema ETL automático que normaliza y consolida las cotizaciones de vida, abasto y carne de las principales lonjas y mercados ganaderos de España. Actualizado diariamente.
                    </p>
                </div>
            </section>

            <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 space-y-20">

                {/* Main Table Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-2">Últimas Cotizaciones</h2>
                            <p className="text-[var(--ag-sys-color-text-muted)]">Explora los precios medios más recientes por categoría.</p>
                        </div>
                    </div>

                    <PriceTable prices={latestPrices} />
                </section>

                {/* Market Explorer */}
                <section>
                    <h2 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-8">Explorar por Mercado</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {markets?.map((market: any) => (
                            <Link 
                                href={`/precios-ganado/vacuno/mercados/${market.id}`} 
                                key={market.id}
                                className="group block bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] p-6 rounded-3xl hover:border-[var(--ag-sys-color-primary)] transition-all hover:shadow-lg hover:shadow-[var(--ag-sys-color-primary)]/5"
                            >
                                <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors mb-2">{market.name}</h3>
                                <div className="flex items-center gap-2 text-sm font-medium text-[var(--ag-sys-color-text-muted)]">
                                    <span>{market.province}</span>
                                    <span>•</span>
                                    <span>{market.region}</span>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--ag-sys-color-text-muted)]">Ver Histórico</span>
                                    <ArrowRightIcon className="w-5 h-5 text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)] transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                
                {/* SEO Text Block */}
                <section className="prose prose-lg dark:prose-invert max-w-none text-[var(--ag-sys-color-text-muted)]">
                    <h3>Sobre los precios de mercado en Ruralpop</h3>
                    <p>
                        Nuestra plataforma recopila de forma automática las cotizaciones oficiales publicadas por los principales mercados nacionales de ganado y lonjas agropecuarias. Los datos mostrados tienen un propósito estrictamente informativo. Ruralpop no altera los precios origen, únicamente los normaliza a un modelo estándar (euros por unidad, euros por kilo vivo o canal) para facilitar su comparación histórica.
                    </p>
                    <p>
                        Recomendamos consultar siempre la fuente oficial enlazada en cada cotización para obtener la hoja de mercado original completa, así como los comentarios de los vocales de la lonja correspondientes a esa semana.
                    </p>
                </section>
            </div>
        </div>
    );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    );
}
