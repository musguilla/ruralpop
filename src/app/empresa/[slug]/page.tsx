import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { Building2, MapPin, ShieldCheck, BadgeCheck, Sparkles, ArrowRight, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CompanySearchInput } from "./CompanySearchInput";
import { getImageUrl } from "@/utils/mediaUtils";
import { CompanyCategoriesSidebar, type CategoryWithSubcategories } from "./CompanyCategoriesSidebar";
import { getServerTenantSlug, getServerTenantFilterString } from "@/utils/tenant/server";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    const supabase = await createClient();
    const { data: companies } = await supabase
        .from('users')
        .select('commercial_name, company_description, is_ghost')
        .eq('role', 'profesional');
        
    const company = companies?.find((c: any) => {
        const cSlug = c.commercial_name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return cSlug === slug;
    });

    const name = company?.commercial_name || "Perfil no encontrado";
    const rawDesc = company?.company_description || `Encuentra todos los anuncios, productos e información sobre ${name} en Ruralpop.`;
    const description = rawDesc.length > 155 ? rawDesc.substring(0, 152) + "..." : rawDesc;
    
    return {
        title: `${name} - Anuncios y Perfil Profesional | Ruralpop`,
        description: description,
    };
}

export default async function CompanyProfilePage({ params, searchParams }: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const sp = await searchParams;
    const slug = (await params).slug;
    const searchTerm = typeof sp.q === 'string' ? sp.q : '';
    const token = typeof sp.token === 'string' ? sp.token : null;

    const supabase = await createClient();

    // Robust slug matching (accent-insensitive, exact-match against normalized DB names)
    const { data: companies, error: companyError } = await supabase
        .from('users')
        .select('id, commercial_name, company_description, company_address, company_zip, company_country, company_website, avatar_url, role, plan_type, is_ghost, ghost_token')
        .eq('role', 'profesional');

    const company = companies?.find((c: any) => {
        const cSlug = c.commercial_name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return cSlug === slug;
    });

    if (companyError || !company) {
        return <div className="p-8"><pre>DEBUG ERROR OR NOT FOUND: {JSON.stringify({ error: companyError, slug, numCompanies: companies?.length, found: !!company }, null, 2)}</pre></div>;
    }

    const isValidGhostToken = token && company.is_ghost && company.ghost_token === token;

    if (company.is_ghost && !isValidGhostToken) {
        return <div className="p-8"><pre>DEBUG GHOST: {JSON.stringify({ token, ghostToken: company.ghost_token, isGhost: company.is_ghost, match: company.ghost_token === token, isValidGhostToken }, null, 2)}</pre></div>;
    }

    const gridSearchParams = {
        ...sp,
        user_id: company.id, // Force the grid to filter by this specific professional
        is_ghost_profile: company.is_ghost ? "true" : undefined
    };

    // Sidebar Category Logic
    const tenantSlug = await getServerTenantSlug();
    const isEquipop = tenantSlug === 'equipop';
    const tenantFilterString = await getServerTenantFilterString();

    const { data: userListings } = await supabase
        .from('listings')
        .select('category, subcategory, equipop_category, equipop_subcategory')
        .eq('user_id', company.id)
        .in('status', ['active', 'sold']);

    const [{ data: categoriesData }, { data: subcategoriesData }] = await Promise.all([
        supabase.from('categories').select('id, name').or(tenantFilterString),
        supabase.from('subcategories').select('id, name, category_id').or(tenantFilterString)
    ]);

    const categoryMap = new Map<string, CategoryWithSubcategories>();
    
    if (userListings && categoriesData && subcategoriesData) {
        userListings.forEach((listing: any) => {
            const catId = isEquipop ? listing.equipop_category : listing.category;
            const subId = isEquipop ? listing.equipop_subcategory : listing.subcategory;

            if (catId) {
                if (!categoryMap.has(catId)) {
                    const catName = categoriesData.find((c: any) => c.id === catId)?.name || catId;
                    categoryMap.set(catId, { id: catId, name: catName, subcategories: [] });
                }

                if (subId) {
                    const cat = categoryMap.get(catId)!;
                    if (!cat.subcategories.find(s => s.id === subId)) {
                        const subName = subcategoriesData.find((s: any) => s.id === subId)?.name || subId;
                        cat.subcategories.push({ id: subId, name: subName });
                    }
                }
            }
        });
    }

    const availableCategories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    availableCategories.forEach(c => c.subcategories.sort((a, b) => a.name.localeCompare(b.name)));

    return (
        <main className="min-h-screen bg-[var(--ag-sys-color-background)] pb-20">
            {company.is_ghost && isValidGhostToken && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
                                    <Sparkles className="w-8 h-8 text-amber-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold">¡Esta es la demostración de tu escaparate profesional!</h2>
                                        <span className="bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">Solo visible para ti</span>
                                    </div>
                                    <p className="text-indigo-100 font-medium text-sm max-w-2xl">
                                        Hemos creado este perfil pre-configurado para ti. Reclámalo ahora, activa tu plan profesional y empieza a vender a nivel nacional.
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href={`/profesionales/reclamar?token=${token}`}
                                className="w-full md:w-auto bg-white text-indigo-700 hover:bg-gray-50 font-black px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2"
                            >
                                Reclamar Perfil y Activar
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Banner */}
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="py-12 md:py-16 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Logo Wrapper */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200 overflow-hidden">
                                    {company.avatar_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={getImageUrl(company.avatar_url)} alt={company.commercial_name || "Logo empresa"} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                                
                                {company.plan_type === 'pro' && (
                                    <div className="absolute -bottom-[6px] -right-[6px] bg-white rounded-full shadow-sm z-10 flex items-center justify-center pointer-events-none" title="Perfil Profesional Verificado">
                                        <BadgeCheck className="w-8 h-8 text-white fill-blue-500" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl sm:text-4xl font-black text-[var(--ag-sys-color-text)] tracking-tight">
                                        {company.commercial_name}
                                    </h1>
                                    <span className="bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        Profesional
                                    </span>
                                </div>
                                
                                {company.company_address && (
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--ag-sys-color-text-muted)]">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {company.company_address}{company.company_zip ? `, ${company.company_zip}` : ''}{company.company_country ? `, ${company.company_country}` : ''}
                                        </div>
                                    </div>
                                )}
                                
                                {company.company_website && (
                                    <div className="flex flex-wrap items-center mt-2.5">
                                        <Link 
                                            href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-[var(--ag-sys-color-primary)] hover:opacity-80 transition-opacity flex items-center gap-1.5"
                                        >
                                            <Globe className="w-4 h-4" />
                                            Sitio web
                                        </Link>
                                    </div>
                                )}
                                
                                {company.company_description && (
                                    <p className="text-[var(--ag-sys-color-text-muted)] max-w-2xl mt-4 text-sm leading-relaxed">
                                        {company.company_description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory / Listings */}
            <div className="container mx-auto px-4 max-w-7xl mt-12">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Main Content (Left on Desktop, Bottom on Mobile) */}
                    <div className="w-full lg:flex-1 lg:order-1 order-2 min-w-0">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">
                                Catálogo de Anuncios
                            </h2>
                            <p className="text-[var(--ag-sys-color-text-muted)] font-medium mt-1">
                                Explora todos los productos de este vendedor
                            </p>
                        </div>
                        <ListingsGrid searchParams={gridSearchParams} disableInFeedAds={true} />
                    </div>

                    {/* Sidebar (Right on Desktop, Top on Mobile) */}
                    <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 flex flex-col gap-6 lg:order-2 order-1 z-10">
                        <CompanySearchInput initialSearchTerm={searchTerm} />
                        <CompanyCategoriesSidebar categories={availableCategories} />
                    </aside>
                </div>
            </div>
        </main>
    );
}
