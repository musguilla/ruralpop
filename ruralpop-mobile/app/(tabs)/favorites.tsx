import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "../../src/lib/supabase";
import { ListingCard } from "../../src/components/ui/ListingCard";
import { Listing } from "../../src/types";
import { useFavorites } from "../../src/contexts/FavoritesContext";
import { useFavoriteProfiles } from "../../src/hooks/useFavoriteProfiles";
import { FavoriteProfileCard } from "../../src/components/ui/FavoriteProfileCard";
import { getDefaultTenantFilterString } from "../../src/config/tenants";

const { width } = Dimensions.get('window');
const numColumns = width > 768 ? 3 : 2;

export default function FavoritesScreen() {
    const { session, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { favorites } = useFavorites();
    const insets = useSafeAreaInsets();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'profiles'>('products');
    
    const { favoriteProfiles, loading: loadingFavProfiles, refreshFavorites } = useFavoriteProfiles();
    const [profilesData, setProfilesData] = useState<any[]>([]);
    useFocusEffect(
        useCallback(() => {
            refreshFavorites();
        }, [refreshFavorites])
    );

    const [profilesListings, setProfilesListings] = useState<Record<string, any[]>>({});
    const [loadingProfiles, setLoadingProfiles] = useState(false);

    async function fetchFavoritedProfiles() {
        if (favoriteProfiles.length === 0) {
            setProfilesData([]);
            setLoadingProfiles(false);
            return;
        }
        setLoadingProfiles(true);
        try {
            const { data: users } = await supabase.from('users').select('*').in('id', favoriteProfiles);
            if (users) {
                setProfilesData(users);
                const { data: userListings } = await supabase.from('listings').select('id, user_id, image_urls').in('user_id', favoriteProfiles).eq('status', 'active').or(getDefaultTenantFilterString());
                if (userListings) {
                    const grouped: Record<string, any[]> = {};
                    userListings.forEach(l => {
                        if (!grouped[l.user_id]) grouped[l.user_id] = [];
                        grouped[l.user_id].push(l);
                    });
                    setProfilesListings(grouped);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingProfiles(false);
        }
    }
    
    useEffect(() => {
        if (activeTab === 'profiles') {
            setProfilesData(prev => prev.filter(p => favoriteProfiles.includes(p.id)));
            fetchFavoritedProfiles();
        }
    }, [activeTab, favoriteProfiles]);

    async function fetchFavoritedListings() {
        if (!session || favorites.size === 0) {
            setListings([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .in('id', Array.from(favorites))
                .eq('status', 'active')
                .or(getDefaultTenantFilterString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Additional fallback filtering locally, ensuring they are active
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching favorite listings', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (!authLoading) {
            fetchFavoritedListings();
        }
    }, [authLoading, favorites.size]); // Re-fetch or verify if favorites set size changes broadly

    useEffect(() => {
        // Just in case individual items get removed from favorites, we prune locally silently
        // instead of doing an expensive re-fetch every single toggle.
        setListings(prev => prev.filter(l => favorites.has(l.id)));
    }, [favorites]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavoritedListings();
    };

    if (authLoading) return null;

    if (!session) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-6">
                    <Heart className="text-primary" size={32} />
                </View>
                <Text className="text-xl font-bold text-center text-text mb-2">Inicia sesión para ver tus favoritos</Text>
                <Text className="text-center text-text-muted mb-8">
                    Guarda los anuncios que más te interesen para no perderlos de vista.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full mb-2 w-full items-center"
                >
                    <Text className="text-white font-bold text-base">Iniciar sesión</Text>
                </TouchableOpacity>
                <Text className="text-text-muted mt-4 mb-4">Si no tienes una cuenta</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="border-2 border-primary px-8 py-3 rounded-full w-full items-center"
                >
                    <Text className="text-primary font-bold text-base">Registrarme</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <View 
                className="px-6 pb-4 bg-white"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <Text className="text-2xl font-extrabold text-text">Favoritos</Text>
            </View>

            {/* Tabs */}
            <View className="px-4 pb-4 bg-white border-b border-gray-100">
                <View className="flex-row bg-gray-100 rounded-full self-start p-1">
                    <TouchableOpacity
                        onPress={() => setActiveTab('products')}
                        className={`px-6 py-2 rounded-full ${activeTab === 'products' ? 'bg-[#1a2b3c]' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'products' ? 'text-white' : 'text-gray-600'}`}>Productos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('profiles')}
                        className={`px-6 py-2 rounded-full ${activeTab === 'profiles' ? 'bg-[#1a2b3c]' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'profiles' ? 'text-white' : 'text-gray-600'}`}>Perfiles</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'products' ? (
                loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : (
                    <FlatList
                        key={`grid-${numColumns}`}
                        data={listings}
                        keyExtractor={(item) => item.id}
                        numColumns={numColumns}
                        columnWrapperStyle={{ flex: 1, justifyContent: 'flex-start' }}
                        renderItem={({ item }) => (
                            <View className="p-1" style={{ flex: 1, maxWidth: `${100 / numColumns}%` }}>
                                <ListingCard listing={item} />
                            </View>
                        )}
                        contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center p-12 mt-10">
                                <Heart className="text-gray-300 mb-4" size={48} />
                                <Text className="text-xl font-bold text-text mb-2 text-center">Sin favoritos aún</Text>
                                <Text className="text-gray-500 text-center">Navega por los anuncios y presiona el corazón para guardarlos aquí.</Text>
                            </View>
                        }
                    />
                )
            ) : (
                loadingProfiles && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : (
                    <FlatList
                        key="profiles-grid-2"
                        data={profilesData}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <View style={{ width: '48.5%' }}>
                                <FavoriteProfileCard 
                                    profile={item} 
                                    listings={profilesListings[item.id] || []} 
                                    onPress={() => router.push(`/user/${item.id}`)} 
                                />
                            </View>
                        )}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center p-12 mt-10">
                                <Heart color="#d1d5db" style={{ marginBottom: 16 }} size={48} />
                                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">Sin perfiles favoritos</Text>
                                <Text className="text-gray-500 text-center">Los vendedores que guardes aparecerán aquí.</Text>
                            </View>
                        }
                    />
                )
            )}
        </SafeAreaView>
    );
}