import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { Building2, MapPin, Search, ShieldCheck } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const commercialName = decodeURIComponent(slug).replace(/-/g, ' ');
    
    return {
        title: `${commercialName} - Anuncios y Perfil Profesional | Ruralpop`,
        description: `Encuentra todos los anuncios, productos e información sobre ${commercialName} en Ruralpop.`,
    };
}

export default async function CompanyProfilePage({ params, searchParams }: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const sp = await searchParams;
    const slug = (await params).slug;
    const searchTerm = typeof sp.q === 'string' ? sp.q : '';

    const supabase = await createClient();

    // The slug is essentially the commercial name URL-encoded and kebab-cased
    // For simplicity, we search the user by an ILIKE match on commercial_name
    // A more robust approach would be to store a clean slug on the user table, but this works for now.
    const cleanName = decodeURIComponent(slug).replace(/-/g, ' ');

    const { data: company, error: companyError } = await supabase
        .from('users')
        .select('id, commercial_name, company_description, company_address, company_zip, company_country, avatar_url, role, plan_type')
        .ilike('commercial_name', cleanName)
        .eq('role', 'profesional')
        .limit(1)
        .single();

    if (companyError || !company) {
        // If no professional user found with that name
        notFound();
    }

    const gridSearchParams = {
        ...sp,
        user_id: company.id // Force the grid to filter by this specific professional
    };

    return (
        <main className="min-h-screen bg-[var(--ag-sys-color-background)] pb-20">
            {/* Header / Banner */}
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="py-12 md:py-16 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Logo */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200 overflow-hidden relative">
                                {company.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={company.avatar_url} alt={company.commercial_name || "Logo empresa"} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-12 h-12 text-gray-400" />
                                )}
                                
                                {company.plan_type === 'pro' && (
                                    <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" title="Usuario PRO">
                                        <ShieldCheck className="w-4 h-4" />
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
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">
                            Catálogo de Anuncios
                        </h2>
                        <p className="text-[var(--ag-sys-color-text-muted)] font-medium mt-1">
                            Explora todos los productos de este vendedor
                        </p>
                    </div>

                    {/* Simple search filter for their own listings */}
                    <form className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            name="q"
                            defaultValue={searchTerm}
                            placeholder="Buscar en esta tienda..." 
                            className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] shadow-sm"
                        />
                    </form>
                </div>

                <ListingsGrid searchParams={gridSearchParams} />
            </div>
        </main>
    );
}
