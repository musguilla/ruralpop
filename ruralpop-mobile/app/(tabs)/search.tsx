import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Dimensions, RefreshControl, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MapPin, List, SlidersHorizontal, ArrowUpDown, ChevronLeft, ArrowLeft, X, Check } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { Listing } from '../../src/types';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { RectangularBanner } from '../../src/components/ui/RectangularBanner';
import { CategoryModal } from '../../src/components/ui/modals/CategoryModal';
import { LocationModal } from '../../src/components/ui/modals/LocationModal';
import { FiltersModal } from '../../src/components/ui/modals/FiltersModal';
import { CATEGORIES } from '../../src/constants/categories';
import { LOCATIONS } from '../../src/constants/locations';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDefaultTenantFilterString } from '../../src/config/tenants';

const { width } = Dimensions.get('window');
const numColumns = width > 768 ? 3 : 1;

export default function SearchScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const initialCategory = typeof params.category === 'string' ? params.category : null;
    const initialQuery = typeof params.q === 'string' ? params.q : '';

    const [query, setQuery] = useState(initialQuery);
    const [activeQuery, setActiveQuery] = useState(initialQuery);
    const [categoryId, setCategoryId] = useState<string | null>(initialCategory);
    const [locationId, setLocationId] = useState<string | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sellerType, setSellerType] = useState('Todos');
    const [filterTrigger, setFilterTrigger] = useState(0);

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

    const sortOptions = [
        { id: 'newest', label: 'Más recientes' },
        { id: 'price_asc', label: 'Precio: de menor a mayor' },
        { id: 'price_desc', label: 'Precio: de mayor a menor' }
    ];

    async function performSearch(pageIndex = 0) {
        if (pageIndex === 0) {
            if (!refreshing) setLoading(true);
        } else {
            setLoadingMore(true);
        }
        try {
            let supabaseQuery = supabase
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
                .or(getDefaultTenantFilterString());

            if (activeQuery) {
                // Use .or() to search across multiple columns like the web app
                supabaseQuery = supabaseQuery.or(`title.ilike.%${activeQuery}%,description.ilike.%${activeQuery}%,location.ilike.%${activeQuery}%`);
            }

            if (categoryId) {
                const normalizedCategory = categoryId.toLowerCase();
                const isMainCategory = CATEGORIES.some(c => c.id.toLowerCase() === normalizedCategory);
                if (isMainCategory) {
                    // Match main category exactly
                    supabaseQuery = supabaseQuery.eq('category', normalizedCategory);
                } else {
                    // Match subcategory exactly (using ilike for case insensitivity) 
                    // This prevents '%Ovino%' from matching 'Bovino'
                    supabaseQuery = supabaseQuery.ilike('subcategory', categoryId);
                }
            }
            // Simple location filter for demo. In production, needs a related province table.
            if (locationId) {
                supabaseQuery = supabaseQuery.ilike('location', `%${locationId}%`);
            }
            if (priceMin) {
                supabaseQuery = supabaseQuery.gte('price', parseInt(priceMin, 10));
            }
            if (priceMax) {
                supabaseQuery = supabaseQuery.lte('price', parseInt(priceMax, 10));
            }

            const from = pageIndex * 30;
            const to = from + 29;

            supabaseQuery = supabaseQuery.order('is_featured', { ascending: false, nullsFirst: false });

            if (sortBy === 'newest') {
                supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            } else if (sortBy === 'price_asc') {
                supabaseQuery = supabaseQuery.order('price', { ascending: true });
            } else if (sortBy === 'price_desc') {
                supabaseQuery = supabaseQuery.order('price', { ascending: false });
            }

            supabaseQuery = supabaseQuery.range(from, to);

            const { data, error } = await supabaseQuery;

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
            console.error("Search Error", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setPage(0);
        setRefreshing(true);
        performSearch(0);
    };

    useEffect(() => {
        setPage(0);
        performSearch(0);
    }, [activeQuery, categoryId, locationId, filterTrigger, sortBy]);

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            performSearch(nextPage);
        }
    };

    // Update category or query if the route params change
    useEffect(() => {
        if (typeof params.category === 'string') {
            setCategoryId(params.category);
        }
        if (typeof params.q === 'string') {
            setQuery(params.q);
            setActiveQuery(params.q);
        }
    }, [params.category, params.q]);

    const handleSearchSubmit = () => {
        setActiveQuery(query.trim());
    };

    const getCategoryLabel = () => {
        if (!categoryId) return 'Categoría';

        // Check main categories first
        const mainCat = CATEGORIES.find(c => c.id === categoryId);
        if (mainCat) return mainCat.label;

        // Check subcategories
        for (const cat of CATEGORIES) {
            if (cat.subcategories) {
                const matchedSub = cat.subcategories.find(s => s.toLowerCase() === categoryId.toLowerCase());
                if (matchedSub) {
                    return matchedSub; // Display the properly cased subcategory name
                }
            }
        }

        return categoryId; // Fallback to raw ID if not found
    };

    const getLocationLabel = () => {
        if (!locationId) return 'Ubicación';
        const loc = LOCATIONS.find(l => l.name.toLowerCase() === locationId.toLowerCase() || l.id.toLowerCase() === locationId.toLowerCase());
        return loc ? loc.name : locationId;
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            {/* Header Search Area */}
            <View 
                className="bg-white px-4 pb-4 border-b border-gray-200 z-10"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 8) : 8 }}
            >

                {/* Main Input with Back Button */}
                <View className="flex-row items-center mb-4 mt-2">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="mr-3 p-1 rounded-full active:bg-gray-100"
                    >
                        <ArrowLeft color="#1f2937" size={26} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-[#f8f9fa] border border-[#9ca3af] rounded-full h-[46px] px-4">
                        <Search color="#374151" size={20} strokeWidth={2.5} />
                        <TextInput
                            className="flex-1 ml-2 text-base text-gray-900 font-medium"
                            style={{ paddingVertical: 0, height: '100%' }}
                            placeholder="Buscar tractores, vacas, aperos..."
                            placeholderTextColor="#9ca3af"
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    setQuery('');
                                    setActiveQuery('');
                                }}
                                className="ml-2 bg-[#4b5563] rounded-full w-[22px] h-[22px] items-center justify-center"
                            >
                                <X color="white" size={14} strokeWidth={3} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter & Sort Row */}
                <View className="flex-row items-center py-2 mt-1">
                    {/* Filtros Button */}
                    <TouchableOpacity
                        onPress={() => setIsFiltersModalOpen(true)}
                        className="flex-row items-center justify-center py-2"
                        style={{ flex: 1 }}
                        activeOpacity={0.7}
                    >
                        <SlidersHorizontal color="#1f2937" size={22} strokeWidth={2.5} />
                        <View className="w-2" />
                        <Text className="text-[17px] font-bold text-[#1f2937]">Filtros</Text>
                        {(!!categoryId || !!locationId || !!priceMin || !!priceMax || sellerType !== 'Todos') && (
                            <View className="bg-[#1f2937] rounded-full w-[22px] h-[22px] items-center justify-center ml-2">
                                <Text className="text-white text-xs font-bold">
                                    {(categoryId ? 1 : 0) + (locationId ? 1 : 0) + (priceMin || priceMax ? 1 : 0) + (sellerType !== 'Todos' ? 1 : 0)}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Separator */}
                    <View className="w-[1px] h-[24px] bg-gray-300 mx-2" />

                    {/* Sort Button */}
                    <TouchableOpacity
                        onPress={() => setIsSortModalOpen(true)}
                        className="flex-row items-center justify-center py-2"
                        style={{ flex: 1 }}
                        activeOpacity={0.7}
                    >
                        <ArrowUpDown color="#1f2937" size={20} strokeWidth={2.5} />
                        <View className="w-2" />
                        <Text className="text-[17px] font-bold text-[#1f2937]" numberOfLines={1}>
                            {sortBy === 'newest' ? 'Más recientes' : (sortOptions.find(opt => opt.id === sortBy)?.label || 'Más recientes')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results Grid */}
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
                    ListHeaderComponent={<RectangularBanner />}
                    renderItem={({ item }) => (
                        <View className="p-1" style={{ flex: 1, maxWidth: numColumns === 1 ? '100%' : `${100 / numColumns}%` }}>
                            <ListingCard listing={item} isSingleColumn={numColumns === 1} />
                        </View>
                    )}
                    contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
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
                        <View className="items-center justify-center p-12 mt-10">
                            <Search color="#d1d5db" style={{ marginBottom: 16 }} size={48} />
                            <Text className="text-xl font-bold text-text mb-2text-center">No hay resultados</Text>
                            <Text className="text-gray-500 text-center">Intenta ajustando los filtros o usando términos más generales.</Text>
                        </View>
                    }
                />
            )}

            {/* Modals */}
            <CategoryModal
                visible={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                selectedCategory={categoryId}
                onSelect={setCategoryId}
            />

            <LocationModal
                visible={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                selectedLocation={locationId}
                onSelect={setLocationId}
            />

            <FiltersModal
                visible={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
                categoryLabel={getCategoryLabel()}
                locationLabel={getLocationLabel()}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                locationId={locationId}
                setLocationId={setLocationId}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                sellerType={sellerType}
                setSellerType={setSellerType}
                onClear={() => {
                    setPriceMin('');
                    setPriceMax('');
                    setCategoryId(null);
                    setLocationId(null);
                    setSellerType('Todos');

                    setFilterTrigger(f => f + 1);
                    setIsFiltersModalOpen(false);
                }}
                onApply={() => {
                    setFilterTrigger(f => f + 1);
                    setIsFiltersModalOpen(false);
                }}
            />

            {/* Sort Modal */}
            <Modal
                visible={isSortModalOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsSortModalOpen(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setIsSortModalOpen(false)}
                >
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-text">Ordenar por</Text>
                            <TouchableOpacity onPress={() => setIsSortModalOpen(false)}>
                                <X color="#9ca3af" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-2">
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => {
                                        setSortBy(option.id as any);
                                        setIsSortModalOpen(false);
                                    }}
                                    className={`flex-row justify-between items-center p-4 rounded-xl ${sortBy === option.id ? 'bg-primary-muted border border-primary/20' : 'bg-gray-50 border border-transparent'}`}
                                >
                                    <Text className={`text-base ${sortBy === option.id ? 'text-primary font-bold' : 'text-gray-700 font-medium'}`}>
                                        {option.label}
                                    </Text>
                                    {sortBy === option.id && (
                                        <Check color="#059669" size={20} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <SafeAreaView />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
