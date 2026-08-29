import React from 'react';
import Link from 'next/link';
import { LOCATIONS } from '@/constants/locations';
import { slugify } from '@/utils/seoUtils';

interface BovineRelatedLinksProps {
    parsedSlug: any;
}

export function BovineRelatedLinks({ parsedSlug }: BovineRelatedLinksProps) {
    // Solo aplicar en ganaderia/bovino
    if (parsedSlug.category !== 'ganaderia' || parsedSlug.subcategory !== 'bovino') {
        return null;
    }

    const relatedTerms = [
        "Angus", "Asturiana de la montaña", "Aubrac", "blonde de aquitania", "Bueyes", "charolais", 
        "fleckvieh", "Frisona", "hereford", "Jatos", "Limousine", "Limusin", "lote vacas", 
        "Novilla", "Novillo", "Parda de montaña", "Parda Suiza", "Pirenaicas", "pastero", "Ratina", 
        "Terneras", "terneras limusinas", "Ternero blonda", "Terneros", "Terneros de vida", 
        "toro", "toro semental", "vaca angus", "Vaca parida", "Vacas", "Vacas de vida", "Vacas preñadas", 
        "Vacas Rubias", "wagyu", "xato pastero"
    ].sort((a, b) => a.localeCompare(b, 'es'));

    // Obtener todas las provincias de España (id <= 52)
    const spanishProvinces = LOCATIONS.filter(l => l.type === 'province' && parseInt(l.id) <= 52);
    
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

    const priorityProvinces = spanishProvinces.filter(p => priorityProvinceIds.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const otherProvinces = spanishProvinces.filter(p => !priorityProvinceIds.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    
    const orderedProvinces = [...priorityProvinces, ...otherProvinces];

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
                            href={`/${slugify(term)}`}
                            className="text-sm bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-text-muted)] px-3 py-1.5 rounded-full transition-colors"
                        >
                            {term}
                        </Link>
                    ))}
                </div>
            </div>

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
        </div>
    );
}
