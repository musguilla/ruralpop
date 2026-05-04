import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { ListingCard } from "../../src/components/ui/ListingCard";
import { Listing } from "../../src/types";
import { useFavorites } from "../../src/contexts/FavoritesContext";

const { width } = Dimensions.get('window');
const numColumns = width > 768 ? 3 : 2;

export default function FavoritesScreen() {
    const { session, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { favorites } = useFavorites();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            <View className="px-6 py-4 border-b border-gray-100 bg-white">
                <Text className="text-2xl font-extrabold text-text">Mis Favoritos</Text>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    key={`grid-${numColumns}`}
                    data={listings}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    renderItem={({ item }) => (
                        <View className="p-1" style={{ flex: 1, maxWidth: `${100 / numColumns}%` }}>
                            <ListingCard listing={item} />
                        </View>
                    )}
                    contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
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
            )}
        </SafeAreaView>
    );
}
