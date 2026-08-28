import { getDefaultTenantFilterString } from '../config/tenants';
import { supabase } from './supabase';
import { Listing } from '../types';

export async function fetchRelevantListings(currentListing: Listing): Promise<Listing[]> {
    // 1. Extract keywords
    const stopwords = ['de', 'la', 'el', 'en', 'para', 'con', 'por', 'muy', 'se', 'año', 'años', 'vendo', 'vende', 'venta', 'oportunidad', 'ocasion', 'gran', 'del', 'las', 'los', 'una', 'uno', 'unos', 'unas', 'este', 'esta', 'estos', 'estas', 'como', 'nuevo', 'nueva'];
    
    const normalizedTitle = (currentListing.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "");
    
    const words = normalizedTitle.split(/\s+/);
    let keywords = words.filter(w => 
        w.length >= 3 && 
        !stopwords.includes(w) && 
        isNaN(Number(w))
    );
    keywords = keywords.slice(0, 6);

    const stem = (word: string) => {
        if (word.length <= 3) return word;
        if (word.endsWith('os') || word.endsWith('as') || word.endsWith('es')) return word.slice(0, -2);
        if (word.endsWith('o') || word.endsWith('a') || word.endsWith('e') || word.endsWith('s')) return word.slice(0, -1);
        return word;
    };

    const stems = keywords.map(stem);

    // 2. Pool de candidatos
    let catQuery = supabase.from('listings')
        .select('*, seller:users!listings_user_id_fkey(*)')
        .eq('status', 'active')
        .neq('id', currentListing.id)
        .neq('user_id', currentListing.user_id)
        .or(getDefaultTenantFilterString());
        
    if (currentListing.subcategory) {
        catQuery = catQuery.eq('subcategory', currentListing.subcategory);
    } else if (currentListing.category) {
        catQuery = catQuery.eq('category', currentListing.category);
    }
    const catPromise = catQuery.order('created_at', { ascending: false }).limit(30);

    let kwPromise: any = Promise.resolve({ data: [] as any[] });
    if (stems.length > 0) {
        const orConditions = stems.map(s => `title.ilike.%${s}%,description.ilike.%${s}%`).join(',');
        let query = supabase.from('listings')
            .select('*, seller:users!listings_user_id_fkey(*)')
            .eq('status', 'active')
            .neq('id', currentListing.id)
            .neq('user_id', currentListing.user_id)
        .or(getDefaultTenantFilterString());
            
        if (currentListing.subcategory) {
            query = query.eq('subcategory', currentListing.subcategory);
        } else if (currentListing.category) {
            query = query.eq('category', currentListing.category);
        }
        
        kwPromise = query.or(orConditions).limit(30);
    }

    const [catRes, kwRes] = await Promise.all([catPromise, kwPromise]);
    
    // Deduplicate
    const candidatesMap = new Map();
    [...(catRes.data || []), ...(kwRes.data || [])].forEach(c => {
        if (!candidatesMap.has(c.id)) {
            candidatesMap.set(c.id, c);
        }
    });
    
    const candidates = Array.from(candidatesMap.values());

    // 3. Scoring
    const scoredCandidates = candidates.map(c => {
        let score = 0;
        let titleMatches = 0;
        
        const cTitle = (c.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cDesc = (c.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        stems.forEach(s => {
            if (cTitle.includes(s)) {
                score += 30;
                titleMatches++;
            }
            if (cDesc.includes(s)) {
                score += 10;
            }
        });

        if (keywords.length > 0 && titleMatches === keywords.length) {
            score += 25;
        }

        if (c.category && currentListing.category && c.category === currentListing.category) {
            score += 15;
        }

        if (c.subcategory && currentListing.subcategory && c.subcategory === currentListing.subcategory) {
            score += 10;
        }

        if (c.price !== null && c.price !== 0 && currentListing.price !== null && currentListing.price !== 0) {
            const priceDiff = Math.abs(c.price - currentListing.price);
            const maxPrice = Math.max(currentListing.price, 1);
            const priceScore = 10 * Math.max(0, 1 - (priceDiff / maxPrice));
            score += priceScore;
        }

        if (c.location && currentListing.location) {
            const cLoc = String(c.location).toLowerCase();
            const currLoc = String(currentListing.location).toLowerCase();
            if (cLoc === currLoc) {
                score += 10;
            } else if (cLoc.includes(currLoc) || currLoc.includes(cLoc)) {
                score += 5;
            }
        }

        const daysOld = (new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) score += 5;
        else if (daysOld < 30) score += 3;
        else if (daysOld < 90) score += 1;

        return { ...c, _score: score };
    });

    // 4. Sorting & limit
    scoredCandidates.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return scoredCandidates.slice(0, 15);
}
