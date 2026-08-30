import React from 'react';
import Link from 'next/link';
import { LOCATIONS } from '@/constants/locations';
import { slugify } from '@/utils/seoUtils';

import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

interface BovineRelatedLinksProps {
    parsedSlug: any;
}

// Cached function to get province counts for ganaderia/bovino
const getBovinoProvinceCounts = unstable_cache(
    async () => {
        const supabase = await createClient();
        const { data } = await supabase
            .from('listings')
            .select('province_id')
            .eq('status', 'active')
            .eq('category', 'ganaderia')
            .ilike('subcategory', 'bovino');
        
        const counts: Record<string, number> = {};
        if (data) {
            data.forEach((l: any) => {
                if (l.province_id) {
                    counts[l.province_id] = (counts[l.province_id] || 0) + 1;
                }
            });
        }
        return counts;
    },
    ['bovino-province-counts'],
    { revalidate: 3600 } // Cache for 1 hour to avoid unnecessary queries
);

export async function BovineRelatedLinks({ parsedSlug }: BovineRelatedLinksProps) {
    // Solo aplicar en ganaderia/bovino
    if (parsedSlug.category !== 'ganaderia' || parsedSlug.subcategory?.toLowerCase() !== 'bovino') {
        return null;
    }

    const provinceCounts = await getBovinoProvinceCounts();

    const relatedTerms = [
        "Angus", "Asturiana de la montaña", "Aubrac", "blonde de aquitania", "Bueyes", "charolais", 
        "fleckvieh", "Frisona", "hereford", "Jatos", "Limousine", "Limusin", "lote vacas", 
        "Novilla", "Novillo", "Parda de montaña", "Parda Suiza", "Pirenaicas", "pastero", "Ratina", 
        "Terneras", "terneras limusinas", "Ternero blonda", "Terneros", "Terneros de vida", 
        "toro", "toro semental", "vaca angus", "Vaca parida", "Vacas", "Vacas de vida", "Vacas preñadas", 
        "Vacas Rubias", "wagyu", "xato pastero"
    ].map(t => t.charAt(0).toUpperCase() + t.slice(1)).sort((a, b) => a.localeCompare(b, 'es'));

    // Obtener todas las provincias de España (id <= 52)
    const spanishProvinces = LOCATIONS.filter(l => l.type === 'province' && parseInt(l.id) <= 52);
    
    // Filtrar solo las provincias que tienen al menos 6 anuncios
    const validProvinces = spanishProvinces.filter(p => (provinceCounts[p.id] || 0) >= 6);

    // Determinar si estamos en una comunidad para priorizar sus provincias
    let priorityProvinceIds: string[] = [];
    if (parsedSlug.province_id) {
        const currentLocation = LOCATIONS.find(l => l.id === parsedSlug.province_id);
        if (currentLocation?.type === 'community' && currentLocation.provinces) {
            priorityProvinceIds = currentLocation.provinces;
        } else if (currentLocation?.type === 'province') {
            // Si ya estamos en una provincia, buscamos si pertenece a alguna comunidad para priorizar las hermanas
            const parentCommunity = LOCATIONS.find(l => l.type === 'community' && l.provinces?.includes(currentLocation.id));
            if (parentCommunity && parentCommunity.provinces) {
                priorityProvinceIds = parentCommunity.provinces;
            }
        }
    }

    const priorityProvinces = validProvinces.filter(p => priorityProvinceIds.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const otherProvinces = validProvinces.filter(p => !priorityProvinceIds.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    
    const orderedProvinces = [...priorityProvinces, ...otherProvinces];

    // Si no hay ninguna provincia válida, no mostramos la sección "En otros lugares"
    const hasProvinces = orderedProvinces.length > 0;

    return (
        <div className="mt-16 mb-8 w-full">
            <hr className="w-full border-t border-[var(--ag-sys-color-border)] mb-8" />
            
            <h2 className="text-2xl font-black text-[var(--ag-sys-color-text)] mb-6">Más como esto</h2>
            
            <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-4">Relacionados</h3>
                <div className="flex flex-wrap gap-2">
                    {relatedTerms.map(term => (
                        <Link 
                            key={term} 
                            href={`/ganaderia/bovino/${slugify(term)}`}
                            className="text-sm bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-text-muted)] px-3 py-1.5 rounded-full transition-colors"
                        >
                            {term}
                        </Link>
                    ))}
                </div>
            </div>

            {hasProvinces && (
                <div>
                    <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-4">En otros lugares</h3>
                    <div className="flex flex-wrap gap-2">
                        {orderedProvinces.map(prov => (
                            <Link 
                                key={prov.id} 
                                href={`/ganaderia/bovino/${slugify(prov.name)}`}
                                className="text-sm bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-text-muted)] px-3 py-1.5 rounded-full transition-colors"
                            >
                                Vacas en {prov.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
