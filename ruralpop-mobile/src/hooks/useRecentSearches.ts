import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_EQUIPOP } from '../config/tenants';

const STORAGE_KEY = IS_EQUIPOP ? '@equipop_recent_searches' : '@ruralpop_recent_searches';
const MAX_SEARCHES = 3;

export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        loadSearches();
    }, []);

    const loadSearches = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                setRecentSearches(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to load recent searches', e);
        }
    };

    const addSearch = async (query: string) => {
        if (!query.trim()) return;
        try {
            const trimmedQuery = query.trim();
            const filtered = recentSearches.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase());
            const newSearches = [trimmedQuery, ...filtered].slice(0, MAX_SEARCHES);
            setRecentSearches(newSearches);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches));
        } catch (e) {
            console.error('Failed to save search', e);
        }
    };

    const clearSearches = async () => {
        try {
            setRecentSearches([]);
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear searches', e);
        }
    };

    return {
        recentSearches,
        addSearch,
        clearSearches,
    };
}
