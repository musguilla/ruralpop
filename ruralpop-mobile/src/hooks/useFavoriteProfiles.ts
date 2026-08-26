import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_EQUIPOP } from '../config/tenants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = IS_EQUIPOP ? '@equipop_favorite_profiles' : '@ruralpop_favorite_profiles';

export function useFavoriteProfiles() {
    const { user } = useAuth();
    const [favoriteProfiles, setFavoriteProfiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        try {
            if (user) {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('favorite_profiles')
                    .select('profile_id')
                    .eq('follower_id', user.id);
                
                if (error) {
                    console.error('Supabase error loading fav profiles (falling back to local):', error.message);
                    const localData = await AsyncStorage.getItem(STORAGE_KEY);
                    setFavoriteProfiles(localData ? JSON.parse(localData) : []);
                } else if (data) {
                    setFavoriteProfiles(data.map(d => d.profile_id));
                }
            } else {
                // Fallback to local storage for guests
                const data = await AsyncStorage.getItem(STORAGE_KEY);
                if (data) {
                    setFavoriteProfiles(JSON.parse(data));
                } else {
                    setFavoriteProfiles([]);
                }
            }
        } catch (e) {
            console.error('Failed to load favorite profiles', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavoriteProfile = async (profileId: string) => {
        if (!profileId) return;
        try {
            const isFav = favoriteProfiles.includes(profileId);
            
            // Optimistic UI update
            let newFavs;
            if (isFav) {
                newFavs = favoriteProfiles.filter(id => id !== profileId);
            } else {
                newFavs = [profileId, ...favoriteProfiles];
            }
            setFavoriteProfiles(newFavs);

            if (user) {
                // Sync with Supabase
                if (isFav) {
                    const { error } = await supabase
                        .from('favorite_profiles')
                        .delete()
                        .eq('follower_id', user.id)
                        .eq('profile_id', profileId);
                    if (error) {
                        console.error('Failed to delete from supabase:', error.message);
                        // Fallback to local
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
                    }
                } else {
                    const { error } = await supabase
                        .from('favorite_profiles')
                        .insert({ follower_id: user.id, profile_id: profileId });
                    if (error) {
                        console.error('Failed to insert into supabase:', error.message);
                        // Fallback to local
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
                    }
                }
            } else {
                // Save locally for guests
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
            }
        } catch (e) {
            console.error('Failed to toggle favorite profile', e);
            // Revert on error
            loadFavorites();
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
