import { TractorFeaturePage } from '@/components/tractores/features/TractorFeaturePage';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createClient();
    const { data } = await supabase
        .from('tractor_feature_pages')
        .select('seo_title, seo_description, indexable, canonical_url')
        .eq('feature_type', 'transmission')
        .eq('slug', params.slug)
        .single();

    if (!data) return { title: 'No encontrado' };

    return {
        title: data.seo_title,
        description: data.seo_description,
        alternates: {
            canonical: data.canonical_url ? `https://www.ruralpop.com${data.canonical_url}` : undefined
        },
        robots: {
            index: data.indexable,
            follow: true
        }
    };
}

export default async function Page(props: Props) {
    const params = await props.params;
    return <TractorFeaturePage featureType="transmission" slug={params.slug} />;
}
