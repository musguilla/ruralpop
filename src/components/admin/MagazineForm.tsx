"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";

type MagazinePostProps = {
    initialData?: {
        id: string;
        title: string;
        slug: string;
        category: string;
        image_url: string;
        excerpt: string;
        content: string;
        is_published: boolean;
        created_at?: string;
    };
    actionPromise: (formData: FormData) => Promise<void>;
};

export function MagazineForm({ initialData, actionPromise }: MagazinePostProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            await actionPromise(formData);
            router.push("/admin/marketing/cms");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al procesar el artículo");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">
                        {initialData ? "Editar Artículo" : "Nuevo Artículo"}
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)]">
                        Completa los detalles para tu entrada de blog.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm" encType="multipart/form-data">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Títular H1</label>
                        <input
                            type="text"
                            name="title"
                            defaultValue={initialData?.title}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                            placeholder="Ej: España lidera la exportación..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            defaultValue={initialData?.slug}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition bg-gray-50"
                            placeholder="ej: mercado-porcino-iberoamerica"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                        <select
                            name="category"
                            defaultValue={initialData?.category || "Economía"}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                        >
                            <option value="Vida Rural">Vida Rural</option>
                            <option value="Compraventa">Compraventa</option>
                            <option value="Agricultura y Ganadería">Agricultura y Ganadería</option>
                            <option value="Inversión Rural">Inversión Rural</option>
                            <option value="Maquinaria">Maquinaria</option>
                            <option value="Guías Legales">Guías Legales</option>
                            <option value="Historias Rurales">Historias Rurales</option>
                            <option value="Tendencias">Tendencias</option>
                            <option value="Economía y Lonja">Economía y Lonja</option>
                            <option value="Innovación">Innovación</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Imagen de Portada</label>
                        {initialData?.image_url && (
                            <div className="mb-3">
                                <img src={initialData.image_url} alt="Portada actual" className="h-32 object-cover rounded-xl shadow-sm" />
                                <p className="text-xs text-gray-500 mt-1">Sube una nueva imagen para reemplazar la actual.</p>
                            </div>
                        )}
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            required={!initialData?.image_url}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                        />
                        {initialData?.image_url && (
                            <input type="hidden" name="existing_image_url" value={initialData.image_url} />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Extracto / Bajada (SEO Description)</label>
                    <textarea
                        name="excerpt"
                        defaultValue={initialData?.excerpt}
                        required
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                        placeholder="Breve resumen del artículo para las tarjetas y buscadores..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contenido principal (Soporta HTML)</label>
                    <textarea
                        name="content"
                        defaultValue={initialData?.content}
                        rows={15}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] font-mono text-sm transition"
                        placeholder="<p>Escribe aquí el contenido en HTML...</p>"
                    />
                </div>

                <div className="flex items-center gap-3 py-4 border-t border-gray-100">
                    <input
                        type="checkbox"
                        name="is_published"
                        id="is_published"
                        defaultChecked={initialData?.is_published ?? true}
                        className="w-5 h-5 text-[var(--ag-sys-color-primary)] rounded border-gray-300 focus:ring-[var(--ag-sys-color-primary)]"
                    />
                    <label htmlFor="is_published" className="text-gray-700 font-medium cursor-pointer">
                        Publicado inmediatamente visible al público
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Creación / Publicación</label>
                    <input
                        type="text"
                        name="created_at"
                        defaultValue={initialData?.created_at ? new Date(initialData.created_at).toISOString().slice(0, 16).replace('T', ' ') : ""}
                        className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition"
                        placeholder="Ej: 2024-03-01 12:00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formato recomendado: YYYY-MM-DD HH:mm (Déjalo en blanco para usar la fecha actual al crear nuevos).</p>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 bg-[var(--ag-sys-color-primary)] text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSubmitting ? "Guardando..." : "Guardar Artículo"}
                    </button>
                </div>
            </form>
        </div>
    );
}
