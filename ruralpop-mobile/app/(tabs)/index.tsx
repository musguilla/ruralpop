import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { CategoriesSlider } from '../../src/components/ui/CategoriesSlider';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { NativeAdCard } from '../../src/components/ui/NativeAdCard';
import { RectangularBanner } from '../../src/components/ui/RectangularBanner';
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

        <RectangularBanner />

        <View className="px-4 mb-4 mt-2">
            <Text className="text-xl font-bold text-text">Últimos anuncios</Text>
        </View>
    </View>
);

export default function Home() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const router = useRouter();

    async function fetchListings(pageIndex = 0) {
        if (pageIndex === 0) {
            if (!refreshing) setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const from = pageIndex * 30;
            const to = from + 29;

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
                  category,
                  description,
                  user_id,
                  status,
                  is_featured
                `)
                .eq('status', 'active')
                .order('is_featured', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            const fetchedData = data || [];
            if (fetchedData.length < 30) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (pageIndex === 0) {
                setListings(fetchedData);
            } else {
                setListings(prev => {
                    const existingIds = new Set(prev.map(l => l.id));
                    const uniqueNew = fetchedData.filter(l => !existingIds.has(l.id));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        setPage(0);
        fetchListings(0);
    }, []);

    const onRefresh = () => {
        setPage(0);
        setRefreshing(true);
        fetchListings(0);
    };

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchListings(nextPage);
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push({ pathname: '/(tabs)/search', params: { q: searchQuery.trim() } });
        }
    };

    const dataWithAds = useMemo(() => {
        const result: any[] = [];
        listings.forEach((item, index) => {
            if (index === 9) {
                result.push({ isAd: true, id: 'ad-10' });
            }
            if (index === 20) {
                result.push({ isAd: true, id: 'ad-21' });
            }
            result.push(item);
        });
        return result;
    }, [listings]);

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
                    data={dataWithAds}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    renderItem={({ item }) => {
                        if (item.isAd) {
                            return (
                                <View className="flex-1 p-1" style={{ maxWidth: `${100 / numColumns}%` }}>
                                    <NativeAdCard />
                                </View>
                            );
                        }
                        return (
                            <View className="flex-1 p-1" style={{ maxWidth: `${100 / numColumns}%` }}>
                                <ListingCard listing={item as Listing} />
                            </View>
                        );
                    }}
                    ListHeaderComponent={
                        <HomeHeader
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearchSubmit={handleSearchSubmit}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-6 items-center justify-center">
                                <ActivityIndicator size="small" color="#059669" />
                            </View>
                        ) : null
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
