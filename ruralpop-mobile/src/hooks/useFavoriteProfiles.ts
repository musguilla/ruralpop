import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_EQUIPOP } from '../config/tenants';

const STORAGE_KEY = IS_EQUIPOP ? '@equipop_favorite_profiles' : '@ruralpop_favorite_profiles';

export function useFavoriteProfiles() {
    const [favoriteProfiles, setFavoriteProfiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                setFavoriteProfiles(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to load favorite profiles', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavoriteProfile = async (profileId: string) => {
        if (!profileId) return;
        try {
            const isFav = favoriteProfiles.includes(profileId);
            let newFavs;
            if (isFav) {
                newFavs = favoriteProfiles.filter(id => id !== profileId);
            } else {
                newFavs = [profileId, ...favoriteProfiles];
            }
            setFavoriteProfiles(newFavs);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
        } catch (e) {
            console.error('Failed to toggle favorite profile', e);
        }
    };
    
    const isFavoriteProfile = (profileId: string) => favoriteProfiles.includes(profileId);

    return {
        favoriteProfiles,
        toggleFavoriteProfile,
        isFavoriteProfile,
        loading,
        refreshFavorites: loadFavorites
    };
}
