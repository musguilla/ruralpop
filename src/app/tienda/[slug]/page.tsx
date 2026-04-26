import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { StoreProductClient } from "@/components/store/StoreProductClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import { getImageUrl } from "@/utils/mediaUtils";

type Props = {
    params: Promise<{ slug: string }>;
};


export const revalidate = 3600; // Revalidar cada hora

export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
        .from('products')
        .select('slug')
        .eq('status', 'active');

    return (products || []).map((p) => ({
        slug: p.slug,
    }));
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product } = await supabase
        .from('products')
        .select('title, description, image_urls, media, price')
        .eq('slug', slug)
        .single();

    if (!product) return { title: "Producto no encontrado | Tienda Ruralpop" };

    const firstMedia = product.media?.[0] || product.image_urls?.[0];
    const mainImage = firstMedia ? getImageUrl(firstMedia) : 'https://www.ruralpop.com/default-og.jpg';
    return {
        title: `${product.title} | Tienda Ruralpop`,
        description: product.description || `Compra ${product.title} en la tienda oficial de Ruralpop por solo ${product.price}€.`,
        openGraph: {
            title: `${product.title} | Tienda Ruralpop`,
            description: product.description || `Compra ${product.title} en la tienda oficial de Ruralpop por solo ${product.price}€.`,
            url: `https://www.ruralpop.com/tienda/${slug}`,
            images: [{ url: mainImage.startsWith('http') ? mainImage : `https://www.ruralpop.com${mainImage}`, width: 1200, height: 630 }],
        }
    };
}

export default async function ProductDetailPage(props: Props) {
    const { slug } = await props.params;
    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !product || product.status !== 'active') {
        notFound();
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Volver */}
                <div className="mb-8">
                    <Link
                        href="/tienda"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a la tienda
                    </Link>
                </div>

                <StoreProductClient product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  price: product.price,
                  imageUrls: product.image_urls,
                  media: product.media,
                  description: product.description,
                }} />
            </div>
        </div>
    );
}
