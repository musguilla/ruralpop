import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories';
import { ChevronRight, Home } from 'lucide-react';
import { buildSeoUrl } from '@/utils/seoUtils';
import { LocaleCode } from '@/i18n/config';

interface SeoBreadcrumbsProps {
    parsedSlug: {
        category?: string;
        subcategory?: string;
        q?: string;
        province_id?: string;
    };
    locationName: string;
    locale: LocaleCode;
    brandName?: string;
}

export function SeoBreadcrumbs({ parsedSlug, locationName, locale, brandName = "Inicio" }: SeoBreadcrumbsProps) {
    const { category, subcategory, q, province_id } = parsedSlug;
    
    // We shouldn't show breadcrumbs if there is no query at all
    if (!category && !subcategory && !q && !locationName) return null;

    // Use "en" or "em" based on locale
    const inLoc = locale === 'pt' ? 'em' : 'en';
    const locSuffix = locationName ? ` ${inLoc} ${locationName}` : '';

    const crumbs = [];
    crumbs.push({ name: brandName, url: '/' });

    if (category) {
        const catObj = CATEGORIES.find(c => c.id === category);
        const name = catObj ? catObj.label : (category.charAt(0).toUpperCase() + category.slice(1));
        crumbs.push({ 
            name: `${name}${locSuffix}`, 
            url: buildSeoUrl({ category, province_id }, locale) 
        });
    }

    if (subcategory) {
        let name = subcategory;
        if (category) {
            const catObj = CATEGORIES.find(c => c.id === category);
            if (catObj) {
                const subObj = catObj.subcategories.find(s => s.toLowerCase() === subcategory.toLowerCase());
                if (subObj) name = subObj;
            }
        } else {
            name = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
        }
        crumbs.push({ 
            name: `${name}${locSuffix}`, 
            url: buildSeoUrl({ category, subcategory, province_id }, locale) 
        });
    }

    if (q) {
        const name = q.charAt(0).toUpperCase() + q.slice(1).replace(/-/g, ' ');
        crumbs.push({ 
            name: `${name}${locSuffix}`, 
            url: buildSeoUrl({ category, subcategory, q, province_id }, locale) 
        });
    }
    
    // If there is ONLY a location
    if (!category && !subcategory && !q && locationName) {
        crumbs.push({ 
            name: `Anuncios${locSuffix}`, 
            url: buildSeoUrl({ province_id }, locale) 
        });
    }

    return (
        <nav aria-label="Breadcrumb" className="mb-4 mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <ol className="flex items-center space-x-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 opacity-50" />}
                            {isLast ? (
                                <span className="font-bold text-[var(--ag-sys-color-text)]" aria-current="page">
                                    {crumb.name}
                                </span>
                            ) : (
                                <Link 
                                    href={crumb.url}
                                    className="hover:text-[var(--ag-sys-color-primary)] transition-colors flex items-center"
                                >
                                    {crumb.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
