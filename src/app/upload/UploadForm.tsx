"use client";

import React, { useState, useEffect } from "react";
import { PRICE_TYPES } from "@/constants/categories";
import { useCategories } from "@/context/CategoriesContext";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { createListing, getMunicipalities } from "./actions";
import { Tractor, MapPin, Euro, Phone, Info, Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TagSelector } from "@/components/ui/TagSelector";
import { AnimalWelfareModal } from "@/components/upload/AnimalWelfareModal";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { useTranslation } from "@/context/LocaleContext";

interface UploadFormProps {
    savedPhone: string | null;
    initialProvinces: { id: number; name: string }[];
    userEmail?: string;
    hasWalletConfigured?: boolean;
    isProfesional?: boolean;
    userProfile?: {
        name: string;
        nif: string;
        zoo_register_number: string;
    };
}

export default function UploadForm({ savedPhone, initialProvinces, userEmail, hasWalletConfigured = false, isProfesional = false, userProfile }: UploadFormProps) {
    const { t } = useTranslation();
    const CATEGORIES = useCategories();
    const router = useRouter();
    const { showAlert } = useNotification();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isPending, setIsPending] = useState(false);
    const isTestPro = true;
    const [sellOnline, setSellOnline] = useState(false);
    
    // Animal Welfare restrictions
    const [welfareListingId, setWelfareListingId] = useState<string | null>(null);
    const [showWelfareModal, setShowWelfareModal] = useState(false);

    // Location state
    const [selectedProvince, setSelectedProvince] = useState<number | "">("");
    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | "">("");
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);

    // Form data state for non-native inputs
    const [formDataState, setFormDataState] = useState({
        subcategory: "",
        priceType: PRICE_TYPES[0].id
    });

    useEffect(() => {
        setFormDataState(prev => ({ ...prev, subcategory: "" }));
    }, [selectedCategory]);

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

        // Validaciones manuales obligatorias
        if (!selectedCategory) {
            showAlert({ title: t('upload.error_title'), message: t('upload.required_category'), type: "error" });
            setIsPending(false);
            return;
        }

        if (categoryData && categoryData.subcategories.length > 0 && !formDataState.subcategory) {
            showAlert({ title: t('upload.error_title'), message: t('upload.required_subcategory'), type: "error" });
            setIsPending(false);
            return;
        }

        if (!selectedProvince) {
            showAlert({ title: t('upload.error_title'), message: t('upload.required_province'), type: "error" });
            setIsPending(false);
            return;
        }

        if (!selectedMunicipality) {
            showAlert({ title: t('upload.error_title'), message: t('upload.required_municipality'), type: "error" });
            setIsPending(false);
            return;
        }

        if (imageUrls.length === 0) {
            showAlert({ title: t('upload.error_title'), message: t('upload.required_photo'), type: "error" });
            setIsPending(false);
            return;
        }

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
                    title: t('upload.error_title'),
                    message: res.error,
                    type: "error"
                });
                setIsPending(false);
            } else if (res?.success && res.listingId) {
                if (res.restricted) {
                    setWelfareListingId(res.listingId);
                    setShowWelfareModal(true);
                } else {
                    // Redirect to highlight flow after successful publish
                    router.push(`/dashboard/destacar/${res.listingId}?published=true`);
                    router.refresh();
                }
            }
        } catch (err) {
            console.error(err);
            showAlert({
                title: t('upload.error_title'),
                message: t('upload.unexpected_error'),
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
                    {t('upload.title')}
                </h1>
                <p className="text-[var(--ag-sys-color-text-secondary)] text-sm sm:text-base mt-2">
                    {t('upload.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Fotografías */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                        {t('upload.photos_title')}
                    </h3>
                    <ImageUploader onImagesChange={setImageUrls} />
                </section>

                {/* Información Básica */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                        {t('upload.general_info')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5">{t('upload.title_label')}</label>
                            <input
                                name="title"
                                required
                                placeholder={t('upload.title_placeholder')}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{t('upload.category_label')}</label>
                            <SearchableSelect
                                name="category"
                                required
                                value={selectedCategory}
                                onChange={(val) => setSelectedCategory(val as string)}
                                options={CATEGORIES.map(c => ({ id: c.id, name: c.label }))}
                                placeholder={t('upload.category_placeholder')}
                                searchPlaceholder="Buscar categoría..."
                            />
                        </div>

                        {categoryData && categoryData.subcategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{t('upload.subcategory_label')}</label>
                                <SearchableSelect
                                    name="subcategory"
                                    required
                                    options={categoryData.subcategories.map(s => ({ id: s, name: s }))}
                                    value={formDataState.subcategory}
                                    onChange={(val) => {
                                        const subcat = val as string;
                                        setFormDataState(prev => ({ ...prev, subcategory: subcat }));
                                    }}
                                    placeholder={t('upload.subcategory_placeholder')}
                                    searchPlaceholder="Buscar subcategoría..."
                                />
                            </div>
                        )}

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5">{t('upload.desc_label')}</label>
                            <textarea
                                name="description"
                                required
                                rows={5}
                                placeholder={t('upload.desc_placeholder')}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <TagSelector 
                                category={categoryData?.label || ""} 
                                subcategory={formDataState.subcategory || ""} 
                            />
                        </div>
                    </div>
                </section>

                {/* Precio y Localización */}
                <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <Euro className="w-4 h-4" /> {t('upload.price_label')}
                            </label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{t('upload.price_type_label')}</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <SearchableSelect
                                        name="price_type"
                                        value={formDataState.priceType}
                                        onChange={(val) => setFormDataState(prev => ({ ...prev, priceType: val as string }))}
                                        options={PRICE_TYPES.map(p => ({ id: p.id, name: p.label }))}
                                        placeholder={t('upload.price_type_placeholder')}
                                        disabled={sellOnline}
                                    />
                                </div>
                            </div>
                        </div>

                        {isTestPro && (
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                name="vender_online" 
                                                className="sr-only" 
                                                checked={sellOnline} 
                                                onChange={e => {
                                                    const isChecked = e.target.checked;
                                                    setSellOnline(isChecked);
                                                    if (isChecked) {
                                                        setFormDataState(prev => ({ ...prev, priceType: "fixed" }));
                                                    }
                                                }} 
                                                value="true" 
                                            />
                                            <div className={`block w-12 h-7 rounded-full transition-colors ${sellOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${sellOnline ? 'transform translate-x-5' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-bold text-green-800">Vender online</span>
                                    </label>
                                    
                                    {sellOnline && (
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] whitespace-nowrap">Precio transporte (€)</span>
                                            <input
                                                name="shipping_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue="0"
                                                className="w-full md:w-32 px-3 py-2 rounded-lg border border-[var(--ag-sys-color-border)] bg-white focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {sellOnline && !hasWalletConfigured && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900">
                                                Has activado la venta online pero aún no has configurado tu monedero para recibir los pagos.
                                            </p>
                                            <a href="/dashboard/monedero" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--ag-sys-color-primary)] hover:underline mt-1 inline-block">
                                                Configurar mi monedero →
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> {t('upload.province_label')}
                            </label>
                            <SearchableSelect
                                name="province_id"
                                required
                                value={selectedProvince}
                                onChange={(val) => setSelectedProvince(val as number | "")}
                                options={initialProvinces}
                                placeholder={t('upload.province_placeholder')}
                                searchPlaceholder="Ej: Salamanca, Asturias..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> {t('upload.municipality_label')}
                            </label>
                            <SearchableSelect
                                name="municipality_id"
                                required
                                value={selectedMunicipality}
                                onChange={(val) => setSelectedMunicipality(val as number | "")}
                                options={municipalities}
                                placeholder={selectedProvince === "" ? "Selecciona primero provincia" : t('upload.municipality_placeholder')}
                                searchPlaceholder="Ej: Suances, Tineo..."
                                disabled={selectedProvince === ""}
                                isLoading={isLoadingMunicipalities}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <Phone className="w-4 h-4" />
                                {t('upload.phone_label')}
                                {savedPhone && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-semibold">
                                        {t('upload.phone_autofill')}
                                    </span>
                                )}
                            </label>
                            <input
                                name="contact_phone"
                                type="tel"
                                // El valor guardado en el perfil se precarga automáticamente
                                defaultValue={savedPhone ?? ""}
                                placeholder="600 000 000"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                            />
                            {/* El texto descriptivo ha sido eliminado a petición del usuario */}
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
                                {t('upload.submitting')}
                            </>
                        ) : t('upload.submit_btn')}
                    </button>
                </div>
            </form>

            {showWelfareModal && welfareListingId && (
                <AnimalWelfareModal 
                    isOpen={showWelfareModal} 
                    onClose={() => {
                        setShowWelfareModal(false);
                        router.push("/dashboard");
                    }}
                    listingId={welfareListingId}
                    listingSlug=""
                    initialData={{
                        name: userProfile?.name,
                        nif: userProfile?.nif,
                        zoo_register_number: userProfile?.zoo_register_number,
                        contact_phone: savedPhone || undefined
                    }}
                />
            )}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - El teléfono se precarga desde el perfil del usuario (prop 'savedPhone' del Server Component padre).
 * - Al publicar, el Server Action 'createListing' actualiza también el perfil de usuario con el nuevo teléfono.
 * - No se usa state para el teléfono (es un input no controlado con defaultValue) para maximizar rendimiento.
 */
