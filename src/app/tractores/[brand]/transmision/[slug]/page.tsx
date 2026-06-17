import { TractorCombinationPage } from '@/components/tractores/features/TractorCombinationPage';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

interface Props {
    params: Promise<{ brand: string, slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const params = await props.params;
    const supabase = await createClient();
    const urlPath = `/tractores/${resolvedParams.brand}/transmision/${resolvedParams.slug}`;
    const { data } = await supabase.from('tractor_combination_pages').select('seo_title, seo_description, indexable, canonical_url').eq('url_path', urlPath).single();
    if (!data) return { title: 'No encontrado' };
    return { title: data.seo_title, description: data.seo_description, alternates: { canonical: data.canonical_url ? `https://www.ruralpop.com${data.canonical_url}` : undefined }, robots: { index: data.indexable, follow: true } };
}

export default async function Page({ params }: Props) {
    const resolvedParams = await params;
    return <TractorCombinationPage urlPath={`/tractores/${resolvedParams.brand}/transmision/${resolvedParams.slug}`} />;
}
