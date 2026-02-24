import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { CategoriesSlider } from '../../src/components/ui/CategoriesSlider';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { supabase } from '../../src/lib/supabase';
import { Listing } from '../../src/types';
import { Search } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const numColumns = width > 768 ? 3 : 2;

const HomeHeader = ({ searchQuery, setSearchQuery, onSearchSubmit }: { searchQuery: string, setSearchQuery: (s: string) => void, onSearchSubmit: () => void }) => (
    <View>
        <View className="px-4 mt-6">
            <View className="flex-row items-center bg-white border border-gray-200 rounded-full h-14 px-4 shadow-sm">
                <Search color="#9ca3af" size={24} />
                <TextInput
                    className="flex-1 ml-3 text-base text-text h-full"
                    placeholder="Estoy buscando..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={onSearchSubmit}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>
        </View>

        <CategoriesSlider />

        <View className="px-4 mb-4">
            <Text className="text-xl font-bold text-text">Últimos anuncios</Text>
        </View>
    </View>
);

export default function Home() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    async function fetchListings() {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
          id,
          title,
          price,
          price_type,
          location,
          image_urls,
          created_at,
          category
        `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchListings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push({ pathname: '/(tabs)/search', params: { q: searchQuery.trim() } });
        }
    };

    // Header is handled by HomeHeader component Above
    return (
        <View className="flex-1 bg-surface-muted pt-12">
            {/* Header that sticks to top */}
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row justify-center items-center h-14">
                <Text className="text-2xl font-extrabold text-primary tracking-tight">ruralpop</Text>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    renderItem={({ item }) => (
                        <View className="flex-1 p-2" style={{ maxWidth: `${100 / numColumns}%` }}>
                            <ListingCard listing={item} />
                        </View>
                    )}
                    ListHeaderComponent={
                        <HomeHeader
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearchSubmit={handleSearchSubmit}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-gray-500 text-center">No hay anuncios disponibles en este momento.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
