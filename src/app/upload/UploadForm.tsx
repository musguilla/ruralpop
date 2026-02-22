"use client";

import React, { useState, useEffect } from "react";
import { CATEGORIES, PRICE_TYPES } from "@/constants/categories";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { createListing, getMunicipalities } from "./actions";
import { Tractor, MapPin, Euro, Phone, Info, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

interface UploadFormProps {
    savedPhone: string | null;
    initialProvinces: { id: number; name: string }[];
}

export default function UploadForm({ savedPhone, initialProvinces }: UploadFormProps) {
    const router = useRouter();
    const { showAlert } = useNotification();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isPending, setIsPending] = useState(false);

    // Location state
    const [selectedProvince, setSelectedProvince] = useState<number | "">("");
    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | "">("");
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (selectedProvince === "") {
            setMunicipalities([]);
            setSelectedMunicipality("");
            return;
        }

        async function fetchMuni() {
            setIsLoadingMunicipalities(true);
            try {
                const data = await getMunicipalities(selectedProvince as number);
                if (isMounted) {
                    setMunicipalities(data);
                    setSelectedMunicipality("");
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setIsLoadingMunicipalities(false);
                }
            }
        }

        fetchMuni();

        return () => {
            isMounted = false;
        };
    }, [selectedProvince]);

    const categoryData = CATEGORIES.find(c => c.id === selectedCategory);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        formData.append("image_urls", JSON.stringify(imageUrls));

        // Append legacy location string
        const provName = initialProvinces.find(p => p.id === Number(selectedProvince))?.name || "";
        const muniName = municipalities.find(m => m.id === Number(selectedMunicipality))?.name || "";
        const locationString = muniName ? `${muniName} (${provName})` : provName;
        formData.append("location", locationString);

        try {
            const res = await createListing(formData);
            if (res?.error) {
                showAlert({
                    title: "Error al publicar",
                    message: res.error,
                    type: "error"
                });
                setIsPending(false);
            } else if (res?.success) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            showAlert({
                title: "Error inesperado",
                message: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo más tarde.",
                type: "error"
            });
            setIsPending(false);
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-6">
                <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center gap-3">
                    <Tractor className="text-[var(--ag-sys-color-primary)] w-8 h-8" />
                    Publicar nuevo anuncio
                </h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-2">
                    Vende animales, maquinaria y productos del campo de forma segura en Ruralpop.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Fotografías */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                        Fotografías del anuncio
                    </h3>
                    <ImageUploader onImagesChange={setImageUrls} />
                </section>

                {/* Información Básica */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                        Información general
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5">Título del anuncio *</label>
                            <input
                                name="title"
                                required
                                placeholder="Ej: Tractor John Deere 6120M o Terneros Limousin"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Categoría *</label>
                            <select
                                name="category"
                                required
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            >
                                <option value="">Selecciona...</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>

                        {categoryData && categoryData.subcategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Subcategoría *</label>
                                <select
                                    name="subcategory"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                >
                                    <option value="">Selecciona...</option>
                                    {categoryData.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5">Descripción detallada *</label>
                            <textarea
                                name="description"
                                required
                                rows={5}
                                placeholder="Describe el estado, años, mantenimiento, raza, peso..."
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Precio y Localización */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <Euro className="w-4 h-4" /> Precio (€) *
                            </label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Tipo de precio</label>
                            <select
                                name="price_type"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            >
                                {PRICE_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" /> Provincia *
                            </label>
                            <select
                                name="province_id"
                                required
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : "")}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            >
                                <option value="">Selecciona provincia...</option>
                                {initialProvinces.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" /> Localidad *
                            </label>
                            <select
                                name="municipality_id"
                                required
                                value={selectedMunicipality}
                                onChange={(e) => setSelectedMunicipality(e.target.value ? Number(e.target.value) : "")}
                                disabled={selectedProvince === "" || isLoadingMunicipalities}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all disabled:opacity-50"
                            >
                                <option value="">{isLoadingMunicipalities ? "Cargando..." : "Selecciona localidad..."}</option>
                                {municipalities.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <Phone className="w-4 h-4" />
                                Teléfono de contacto
                                {savedPhone && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-semibold">
                                        Autocompletado desde tu perfil
                                    </span>
                                )}
                            </label>
                            <input
                                name="contact_phone"
                                type="tel"
                                // El valor guardado en el perfil se precarga automáticamente
                                defaultValue={savedPhone ?? ""}
                                placeholder="Ej: 600 000 000"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                            <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-1.5">
                                {savedPhone
                                    ? "Usamos el teléfono guardado de tu perfil. Puedes cambiarlo aquí y se actualizará automáticamente."
                                    : "Al publicar, este número se guardará en tu perfil para futuros anuncios."
                                }
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-10 py-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--ag-sys-color-primary)]/20 flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Publicando...
                            </>
                        ) : "Publicar Anuncio"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - El teléfono se precarga desde el perfil del usuario (prop 'savedPhone' del Server Component padre).
 * - Al publicar, el Server Action 'createListing' actualiza también el perfil de usuario con el nuevo teléfono.
 * - No se usa state para el teléfono (es un input no controlado con defaultValue) para maximizar rendimiento.
 */
