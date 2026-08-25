import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect, useState } from "react";
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
    
    const { favoriteProfiles, loading: loadingFavProfiles } = useFavoriteProfiles();
    const [profilesData, setProfilesData] = useState<any[]>([]);
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
                const { data: userListings } = await supabase.from('listings').select('id, user_id, images').in('user_id', favoriteProfiles).eq('status', 'active');
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
        <SafeAreaView className="flex-1 bg-surface">
            <View 
                className="px-6 pb-4 bg-white"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <Text className="text-2xl font-extrabold text-text">Favoritos</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row px-4 pb-4 border-b border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={() => setActiveTab('products')}
                    className={`mr-4 px-4 py-2 rounded-full ${activeTab === 'products' ? 'bg-[#1f2937]' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'products' ? 'text-white' : 'text-gray-600'}`}>Productos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('profiles')}
                    className={`px-4 py-2 rounded-full ${activeTab === 'profiles' ? 'bg-[#1f2937]' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'profiles' ? 'text-white' : 'text-gray-600'}`}>Perfiles</Text>
                </TouchableOpacity>
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
                        data={profilesData}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <View style={{ width: '48.5%' }}>
                                <FavoriteProfileCard 
                                    profile={item} 
                                    listings={profilesListings[item.id] || []} 
                                    onPress={() => router.push(`/user/${item.id}`)} 
                                />
                            </View>
                        )}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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
}
