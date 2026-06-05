import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Edit, Image as ImageIcon, Trash2, Globe, Plus } from "lucide-react";
import Image from "next/image";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";

export const metadata = {
    title: "CMS | Admin Ruralpop"
};

type MagazinePost = {
    id: string;
    slug: string;
    title: string;
    category: string;
    image_url: string;
    is_published: boolean;
};

export default async function MarketingCMSPage() {
    const supabase = await createClient();
    const tenant = await getServerTenantSlug();

    let query = supabase
        .from("magazine_posts")
        .select("*")
        .order("published_at", { ascending: false });

    const tenantId = tenant ? TENANTS_CONFIG[tenant]?.id : null;
    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data: posts, error } = await query;

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">Magazine CMS</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)]">
                        Gestiona los artículos y noticias del blog para atrapar tráfico SEO.
                    </p>
                </div>
                <Link
                    href="/admin/marketing/cms/new"
                    className="inline-flex items-center gap-2 bg-[var(--ag-sys-color-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                    <Plus size={20} />
                    Redactar Artículo
                </Link>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">Error cargando artículos: {error.message}</div>
            ) : (
                <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[var(--ag-sys-color-border)] text-sm text-[var(--ag-sys-color-text-muted)]">
                                    <th className="p-4 font-semibold">Imagen</th>
                                    <th className="p-4 font-semibold">Título y Slug</th>
                                    <th className="p-4 font-semibold">Categoría</th>
                                    <th className="p-4 font-semibold">Estado</th>
                                    <th className="p-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">No hay artículos publicados todavía.</td>
                                    </tr>
                                )}
                                {posts?.map((post: MagazinePost) => (
                                    <tr key={post.id} className="border-b border-[var(--ag-sys-color-border)] hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            {post.image_url ? (
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                    <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-[var(--ag-sys-color-text)] line-clamp-1">{post.title}</p>
                                            <p className="text-sm text-[var(--ag-sys-color-text-muted)] line-clamp-1">/{post.slug}</p>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--ag-sys-color-text-muted)]">
                                            <span className="bg-gray-100 px-3 py-1 rounded-full">{post.category}</span>
                                        </td>
                                        <td className="p-4">
                                            {post.is_published ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Publicado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    Borrador
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/magazine/${post.slug}`}
                                                    target="_blank"
                                                    title="Ver en web"
                                                    className="p-2 text-gray-400 hover:text-[var(--ag-sys-color-primary)] hover:bg-emerald-50 rounded-lg transition"
                                                >
                                                    <Globe size={18} />
                                                </Link>
                                                <Link
                                                    href={`/admin/marketing/cms/${post.id}`}
                                                    title="Editar"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                {/* Delete button using server action */}
                                                <form action={async () => {
                                                    "use server";
                                                    const { deleteMagazinePost } = await import("./actions");
                                                    await deleteMagazinePost(post.id);
                                                }} className="inline">
                                                    <button
                                                        type="submit"
                                                        title="Eliminar"
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Memory Documentation:
// M1: We use a server component for the CMS list to guarantee direct DB fetching without client waterfalls.
// M2: Soft 'is_published' toggles are introduced to allow content drafting before SEO release.
// M3: The image rendering uses Next.js `Image` with a fallback UI to prevent crashes purely relying on remote unsplash.
