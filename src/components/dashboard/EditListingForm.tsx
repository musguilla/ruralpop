"use client";

import React, { useState, useEffect } from "react";
import { PRICE_TYPES } from "@/constants/categories";
import { useCategories } from "@/context/CategoriesContext";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { updateListing } from "@/app/dashboard/actions";
import { getMunicipalities } from "@/app/upload/actions";
import { Tractor, MapPin, Euro, Phone, Info, Loader2, ArrowLeft } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TagSelector } from "@/components/ui/TagSelector";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { useTranslation } from "@/context/LocaleContext";

interface EditListingFormProps {
    listing: any;
    savedPhone: string | null;
    initialProvinces: { id: number; name: string }[];
    initialMunicipalities: { id: number; name: string }[];
    userEmail?: string;
    hasWalletConfigured?: boolean;
    isEquipop?: boolean;
}

export default function EditListingForm({ listing, savedPhone, initialProvinces, initialMunicipalities, userEmail, hasWalletConfigured = false, isEquipop = false }: EditListingFormProps) {
    const { t, locale } = useTranslation();
    const isPt = locale === "pt";
    const CATEGORIES = useCategories();
    const router = useRouter();
    const { showAlert } = useNotification();

    // Derived initial states
    const [selectedCategory, setSelectedCategory] = useState(listing.category || "");
    const [imageUrls, setImageUrls] = useState<string[]>(listing.image_urls || []);
    const [isPending, setIsPending] = useState(false);
    const isTestPro = true;
    const [sellOnline, setSellOnline] = useState(!!listing.vender_online);

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

    // Handle category changes (reset subcategory only if category actually changes from initial)
    useEffect(() => {
        if (selectedCategory && selectedCategory !== listing.category) {
            setFormDataState(prev => ({ ...prev, subcategory: "" }));
        }
    }, [selectedCategory, listing.category]);

    // Handle province changes -> fetch new municipalities
    useEffect(() => {
        let isMounted = true;

        // If it's the initial province, we already have municipalities from server
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

        if (imageUrls.length === 0) {
            showAlert({ 
                title: isPt ? "Campo obrigatório" : "Campo requerido", 
                message: isPt ? "O seu anúncio deve ter pelo menos uma fotografia." : "Tu anuncio debe tener al menos una fotografía.", 
                type: "error" 
            });
            setIsPending(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.append("image_urls", JSON.stringify(imageUrls));

        const provName = initialProvinces.find(p => p.id === Number(selectedProvince))?.name || "";
        const muniName = municipalities.find(m => m.id === Number(selectedMunicipality))?.name || "";
        const locationString = muniName ? `${muniName} (${provName})` : provName;
        formData.append("location", locationString);

        try {
            const res = await updateListing(listing.id, formData);
            if (res?.error) {
                showAlert({
                    title: isPt ? "Erro ao modificar" : "Error al modificar",
                    message: res.error,
                    type: "error"
                });
                setIsPending(false);
            } else if (res?.success) {
                showAlert({
                    title: isPt ? "Anúncio modificado" : "Anuncio modificado",
                    message: isPt ? "As alterações foram guardadas com sucesso." : "Los cambios se han guardado correctamente.",
                    type: "success"
                });
                const isPtNative = typeof window !== 'undefined' && window.location.hostname.includes('ruralpop.pt');
                const dashboardUrl = isPt ? (isPtNative ? "/dashboard" : "/pt/dashboard") : "/dashboard";
                router.push(dashboardUrl);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            showAlert({
                title: isPt ? "Erro inesperado" : "Error inesperado",
                message: isPt ? "Ocorreu um erro ao ligar ao servidor. Tente novamente." : "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
                type: "error"
            });
            setIsPending(false);
        }
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">

                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {isPt ? "Voltar ao Meu Painel" : "Volver a Mi Panel"}
                    </Link>
                </div>

                <div className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-6">
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center gap-3">
                        {isEquipop ? (
                            <span className="text-3xl">🐴</span>
                        ) : (
                            <Tractor className="text-[var(--ag-sys-color-primary)] w-8 h-8" />
                        )}
                        {isPt ? "Modificar anúncio" : "Modificar anuncio"}
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-secondary)] text-sm sm:text-base mt-2">
                        {isPt ? "Faça alterações no seu anúncio. Lembre-se de que fotos com boa qualidade atraem mais compradores." : "Haz cambios en tu anuncio. Recuerda que fotos de buena calidad atraen más compradores."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Fotografías */}
                    <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                            {isPt ? "Fotografias do anúncio" : "Fotografías del anuncio"}
                        </h3>
                        <ImageUploader
                            onImagesChange={setImageUrls}
                            initialImages={imageUrls}
                        />
                    </section>

                    {/* Información Básica */}
                    <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Info className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                            {isPt ? "Informação geral" : "Información general"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">{isPt ? "Título do anúncio *" : "Título del anuncio *"}</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={listing.title}
                                    placeholder={isPt ? "Ex: Trator John Deere 6120M ou Novilhos Limousin" : "Ej: Tractor John Deere 6120M o Terneros Limousin"}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{isPt ? "Categoria *" : "Categoría *"}</label>
                                <SearchableSelect
                                    name="category"
                                    required
                                    value={selectedCategory}
                                    onChange={(val) => setSelectedCategory(val as string)}
                                    options={CATEGORIES.map(c => ({ id: c.id, name: t('category.' + c.id) || c.label }))}
                                    placeholder={isPt ? "Selecione a categoria..." : "Selecciona categoría..."}
                                    searchPlaceholder={isPt ? "Pesquisar categoria..." : "Buscar categoría..."}
                                />
                            </div>

                            {categoryData && categoryData.subcategories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{isPt ? "Subcategoria *" : "Subcategoría *"}</label>
                                    <SearchableSelect
                                        name="subcategory"
                                        required
                                        options={categoryData.subcategories.map(s => ({ id: s, name: t('category.' + s) || s }))}
                                        value={formDataState.subcategory}
                                        onChange={(val) => setFormDataState(prev => ({ ...prev, subcategory: val as string }))}
                                        placeholder={isPt ? "Selecione a subcategoria..." : "Selecciona subcategoría..."}
                                        searchPlaceholder={isPt ? "Pesquisar subcategoria..." : "Buscar subcategoría..."}
                                    />
                                </div>
                            )}

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">{isPt ? "Descrição detalhada *" : "Descripción detallada *"}</label>
                                <textarea
                                    name="description"
                                    required
                                    defaultValue={listing.description}
                                    rows={5}
                                    placeholder={isPt ? "Descreva o estado, anos, manutenção, raça, peso..." : "Describe el estado, años, mantenimiento, raza, peso..."}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-2">
                                <TagSelector 
                                    category={categoryData?.label || ""} 
                                    subcategory={formDataState.subcategory || ""} 
                                    initialTags={listing.tags}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Precio y Localización */}
                    <section className="bg-[var(--ag-sys-color-surface)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm space-y-6">
                        <div className={isEquipop ? "flex flex-col gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                    <Euro className="w-4 h-4" /> {isPt ? "Preço (€) *" : "Precio (€) *"}
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

                            {!isEquipop && (
                                <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--ag-sys-color-text)]">{isPt ? "Tipo de preço" : "Tipo de precio"}</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <SearchableSelect
                                            name="price_type"
                                            value={formDataState.priceType}
                                            onChange={(val) => setFormDataState(prev => ({ ...prev, priceType: val as string }))}
                                            options={PRICE_TYPES.map(type => ({
                                                ...type, label: t(type.id === "fixed" ? "precio_fijo" : type.id === "negotiable" ? "precio_negociable" : "precio_a_convenir") || type.label
                                            })).map(p => ({ id: p.id, name: p.label }))}
                                            placeholder={isPt ? "Selecione o tipo..." : "Selecciona tipo..."}
                                            disabled={sellOnline}
                                        />
                                    </div>
                                </div>
                                </div>
                            )}

                            {isEquipop && (
                                <div className="hidden">
                                    <input type="hidden" name="price_type" value="fixed" />
                                </div>
                            )}

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
                                            <span className="text-sm font-bold text-green-800">{t("vender_online")}</span>
                                        </label>
                                        
                                        {sellOnline && !isEquipop && (
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] whitespace-nowrap">{t("precio_transporte")}</span>
                                                <input
                                                    name="shipping_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    defaultValue={listing.shipping_price || 0}
                                                    className="w-full md:w-32 px-3 py-2 rounded-lg border border-[var(--ag-sys-color-border)] bg-white focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all text-sm"
                                                />
                                            </div>
                                        )}
                                        {sellOnline && isEquipop && (
                                            <input type="hidden" name="shipping_price" value="0" />
                                        )}
                                    </div>
                                    
                                    {sellOnline && !hasWalletConfigured && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-900">
                                                    {isPt 
                                                        ? "Ativou a venda online mas ainda não configurou a sua carteira para receber os pagamentos."
                                                        : "Has activado la venta online pero aún no has configurado tu monedero para recibir los pagos."}
                                                </p>
                                                <a href="/dashboard/monedero" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--ag-sys-color-primary)] hover:underline mt-1 inline-block">
                                                    {t("configurar_mi_monedero_flecha")}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> {isPt ? "Distrito / Região *" : "Provincia *"}
                                </label>
                                <SearchableSelect
                                    name="province_id"
                                    required
                                    value={selectedProvince}
                                    onChange={(val) => setSelectedProvince(val as number | "")}
                                    options={initialProvinces}
                                    placeholder={isPt ? "Selecione o distrito..." : "Selecciona provincia..."}
                                    searchPlaceholder={isPt ? "Ex: Porto, Coimbra, Santarém..." : "Ej: Salamanca, Asturias..."}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-[var(--ag-sys-color-text)]">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" /> {isPt ? "Concelho / Localidade *" : "Localidad *"}
                                </label>
                                <SearchableSelect
                                    name="municipality_id"
                                    required
                                    value={selectedMunicipality}
                                    onChange={(val) => setSelectedMunicipality(val as number | "")}
                                    options={municipalities}
                                    placeholder={selectedProvince === "" ? (isPt ? "Selecione primeiro o distrito" : "Selecciona primero provincia") : (isPt ? "Selecione a localidade..." : "Selecciona localidad...")}
                                    searchPlaceholder={isPt ? "Ex: Sintra, Guimarães..." : "Ej: Suances, Tineo..."}
                                    disabled={selectedProvince === ""}
                                    isLoading={isLoadingMunicipalities}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" />
                                    {isPt ? "Telefone de contacto" : "Teléfono de contacto"}
                                </label>
                                <input
                                    name="contact_phone"
                                    type="tel"
                                    defaultValue={listing.contact_phone || savedPhone || ""}
                                    placeholder={isPt ? "Ex: 910 000 000" : "Ej: 600 000 000"}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                                />
                                <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-1.5">
                                    {isPt ? "Este é o número que os compradores verão." : "Este es el número que verán los compradores."}
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
                                    {isPt ? "A guardar alterações..." : "Guardando cambios..."}
                                </>
                            ) : (isPt ? "Guardar Alterações" : "Guardar Cambios")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se reutiliza la lógica robusta de subida de `UploadForm`, pero en modo edición pre-rellena defaults.
 * - Asegura que se respeta la misma interfaz que 'subir un nuevo anuncio'.
 * - Añade un botón simple superior 'Volver a Mi Panel'.
 */
