import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: Set<string>;
    toggleFavorite: (listingId: string) => Promise<void>;
    loadingFavorites: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loadingFavorites, setLoadingFavorites] = useState(true);

    useEffect(() => {
        if (!user) {
            setFavorites(new Set());
            setLoadingFavorites(false);
            return;
        }

        async function fetchFavorites() {
            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('listing_id')
                    .eq('user_id', user!.id);

                if (error) throw error;

                const favSet = new Set<string>();
                if (data) {
                    data.forEach(item => favSet.add(item.listing_id));
                }
                setFavorites(favSet);
            } catch (error) {
                console.error("Error fetching favorites", error);
            } finally {
                setLoadingFavorites(false);
            }
        }

        fetchFavorites();
    }, [user]);

    const toggleFavorite = async (listingId: string) => {
        if (!user) return; // Silent return if not logged in; UI should ideally prompt login

        const isFavorited = favorites.has(listingId);

        // Optimistic UI update
        const newFavs = new Set(favorites);
        if (isFavorited) {
            newFavs.delete(listingId);
        } else {
            newFavs.add(listingId);
        }
        setFavorites(newFavs);

        try {
            if (isFavorited) {
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('listing_id', listingId);
            } else {
                await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, listing_id: listingId });
            }
        } catch (error) {
            // Revert on error
            console.error("Error toggling favorite", error);
            setFavorites(favorites);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, loadingFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
