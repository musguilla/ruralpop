import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories';
import { ChevronRight, Home } from 'lucide-react';
import { buildSeoUrl } from '@/utils/seoUtils';
import { LocaleCode } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

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

export async function SeoBreadcrumbs({ parsedSlug, locationName, locale, brandName = "Inicio" }: SeoBreadcrumbsProps) {
    const { category, subcategory, q, province_id } = parsedSlug;
    
    // We shouldn't show breadcrumbs if there is no query at all
    if (!category && !subcategory && !q && !locationName) return null;

    const dict = await getDictionary(locale);

    // Use "en" or "em" based on locale
    const inLoc = locale === 'pt' ? 'em' : 'en';
    const locSuffix = locationName ? ` ${inLoc} ${locationName}` : '';

    const crumbs = [];
    crumbs.push({ name: brandName, url: '/' });

    if (category) {
        const catObj = CATEGORIES.find(c => c.id === category);
        let name = catObj ? catObj.label : (category.charAt(0).toUpperCase() + category.slice(1));
        
        // Translate category
        const dictCategory = dict.category as Record<string, string>;
        if (dictCategory && dictCategory[category]) {
            name = dictCategory[category];
        }

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
        
        // Translate subcategory
        const dictCategory = dict.category as Record<string, string>;
        if (dictCategory && dictCategory[name]) {
            name = dictCategory[name];
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
        const anunciosWord = dict.anuncios || "Anuncios";
        crumbs.push({ 
            name: `${anunciosWord}${locSuffix}`, 
            url: buildSeoUrl({ province_id }, locale) 
        });
    }

    return (
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <ol className="flex items-center text-sm text-[var(--ag-sys-color-text-muted)]">
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-1.5 flex-shrink-0 opacity-50" />}
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
