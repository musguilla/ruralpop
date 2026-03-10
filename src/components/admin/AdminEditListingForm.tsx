"use client";

import React, { useState, useEffect } from "react";
import { CATEGORIES, PRICE_TYPES } from "@/constants/categories";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { adminUpdateListing } from "@/app/admin/listings/actions";
import { getMunicipalities } from "@/app/upload/actions";
import { Tractor, MapPin, Euro, Phone, Info, Loader2, ArrowLeft } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

interface AdminEditListingFormProps {
    listing: any;
    initialProvinces: { id: number; name: string }[];
    initialMunicipalities: { id: number; name: string }[];
}

export default function AdminEditListingForm({ listing, initialProvinces, initialMunicipalities }: AdminEditListingFormProps) {
    const router = useRouter();
    const { showAlert } = useNotification();

    // Derived initial states
    const [selectedCategory, setSelectedCategory] = useState(listing.category || "");
    const [imageUrls, setImageUrls] = useState<string[]>(listing.image_urls || []);
    const [isPending, setIsPending] = useState(false);

    // Location state
    const [selectedProvince, setSelectedProvince] = useState<number | "">(listing.province_id || "");
    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>(initialMunicipalities);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | "">(listing.municipality_id || "");
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);

    // Form data state for non-native inputs
    const [formDataState, setFormDataState] = useState({
        subcategory: listing.subcategory || "",
        priceType: listing.price_type || PRICE_TYPES[0].id
    });

    // Handle category changes
    useEffect(() => {
        if (selectedCategory && selectedCategory !== listing.category) {
            setFormDataState(prev => ({ ...prev, subcategory: "" }));
        }
    }, [selectedCategory, listing.category]);

    // Handle province changes -> fetch new municipalities
    useEffect(() => {
        let isMounted = true;

        if (selectedProvince === listing.province_id && initialMunicipalities.length > 0) {
            setMunicipalities(initialMunicipalities);
            return;
        }

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
    }, [selectedProvince, listing.province_id, initialMunicipalities]);

    const categoryData = CATEGORIES.find(c => c.id === selectedCategory);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        formData.append("image_urls", JSON.stringify(imageUrls));

        const provName = initialProvinces.find(p => p.id === Number(selectedProvince))?.name || "";
        const muniName = municipalities.find(m => m.id === Number(selectedMunicipality))?.name || "";
        const locationString = muniName ? `${muniName} (${provName})` : provName;
        formData.append("location", locationString);

        try {
            const res = await adminUpdateListing(listing.id, formData);
            if (res?.error) {
                showAlert({
                    title: "Error al modificar",
                    message: res.error,
                    type: "error"
                });
                setIsPending(false);
            } else if (res?.success) {
                showAlert({
                    title: "Anuncio modificado",
                    message: "Los cambios de moderación se han guardado correctamente.",
                    type: "success"
                });
                router.push("/admin/listings");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            showAlert({
                title: "Error inesperado",
                message: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
                type: "error"
            });
            setIsPending(false);
        }
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] py-6 w-full">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">

                <div className="mb-6">
                    <Link
                        href="/admin/listings"
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver a Moderación
                    </Link>
                </div>

                <div className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-6">
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center gap-3">
                        <Tractor className="text-[var(--ag-sys-color-primary)] w-8 h-8" />
                        Moderar Anuncio (Admin)
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-secondary)] text-sm sm:text-base mt-2">
                        Edita las fotos, título o categoría del anuncio en caso de incumplimiento de normativas.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Fotografías */}
                    <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                            Fotografías del anuncio
                        </h3>
                        <ImageUploader
                            onImagesChange={(urls) => setImageUrls(urls)}
                            initialImages={imageUrls}
                        />
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
                                    defaultValue={listing.title}
                                    placeholder="Ej: Tractor John Deere 6120M o Terneros Limousin"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">Categoría *</label>
                                <SearchableSelect
                                    name="category"
                                    required
                                    value={selectedCategory}
                                    onChange={(val) => setSelectedCategory(val as string)}
                                    options={CATEGORIES.map(c => ({ id: c.id, name: c.label }))}
                                    placeholder="Selecciona categoría..."
                                    searchPlaceholder="Buscar categoría..."
                                />
                            </div>

                            {categoryData && categoryData.subcategories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">Subcategoría *</label>
                                    <SearchableSelect
                                        name="subcategory"
                                        required
                                        options={categoryData.subcategories.map(s => ({ id: s, name: s }))}
                                        value={formDataState.subcategory}
                                        onChange={(val) => setFormDataState(prev => ({ ...prev, subcategory: val as string }))}
                                        placeholder="Selecciona subcategoría..."
                                        searchPlaceholder="Buscar subcategoría..."
                                    />
                                </div>
                            )}

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">Descripción detallada *</label>
                                <textarea
                                    name="description"
                                    required
                                    defaultValue={listing.description}
                                    rows={5}
                                    placeholder="Describe el estado..."
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
                                    defaultValue={listing.price}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">Tipo de precio</label>
                                <SearchableSelect
                                    name="price_type"
                                    value={formDataState.priceType}
                                    onChange={(val) => setFormDataState(prev => ({ ...prev, priceType: val as string }))}
                                    options={PRICE_TYPES.map(p => ({ id: p.id, name: p.label }))}
                                    placeholder="Selecciona tipo..."
                                />
                            </div>

                            <div className="z-20">
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> Provincia *
                                </label>
                                <SearchableSelect
                                    name="province_id"
                                    required
                                    value={selectedProvince}
                                    onChange={(val) => setSelectedProvince(val as number | "")}
                                    options={initialProvinces}
                                    placeholder="Selecciona provincia..."
                                    searchPlaceholder="Ej: Salamanca, Asturias..."
                                />
                            </div>

                            <div className="z-10">
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> Localidad *
                                </label>
                                <SearchableSelect
                                    name="municipality_id"
                                    required
                                    value={selectedMunicipality}
                                    onChange={(val) => setSelectedMunicipality(val as number | "")}
                                    options={municipalities}
                                    placeholder={selectedProvince === "" ? "Selecciona primero provincia" : "Selecciona localidad..."}
                                    searchPlaceholder="Ej: Suances, Tineo..."
                                    disabled={selectedProvince === ""}
                                    isLoading={isLoadingMunicipalities}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" />
                                    Teléfono de contacto
                                </label>
                                <input
                                    name="contact_phone"
                                    type="tel"
                                    defaultValue={listing.contact_phone || ""}
                                    placeholder="Ej: 600 000 000"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                />
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
                                    Aplicando Moderación...
                                </>
                            ) : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
