import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { Search, MapPin, List, SlidersHorizontal, ArrowUpDown, ChevronLeft, X } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { Listing } from '../../src/types';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { CategoryModal } from '../../src/components/ui/modals/CategoryModal';
import { LocationModal } from '../../src/components/ui/modals/LocationModal';
import { FiltersModal } from '../../src/components/ui/modals/FiltersModal';
import { CATEGORIES } from '../../src/constants/categories';
import { LOCATIONS } from '../../src/constants/locations';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const numColumns = width > 768 ? 3 : 1;

export default function SearchScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
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
    const [filterTrigger, setFilterTrigger] = useState(0);

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    async function performSearch(pageIndex = 0) {
        if (pageIndex === 0) {
            setLoading(true);
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
          category
        `)
                .eq('status', 'active');

            if (activeQuery) {
                // Use .or() to search across multiple columns like the web app
                supabaseQuery = supabaseQuery.or(`title.ilike.%${activeQuery}%,description.ilike.%${activeQuery}%,location.ilike.%${activeQuery}%`);
            }

            if (categoryId) {
                const isMainCategory = CATEGORIES.some(c => c.id === categoryId);
                if (isMainCategory) {
                    supabaseQuery = supabaseQuery.eq('category', categoryId);
                } else {
                    // It must be a subcategory
                    supabaseQuery = supabaseQuery.ilike('subcategory', `%${categoryId}%`);
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
            supabaseQuery = supabaseQuery.order('created_at', { ascending: false }).range(from, to);

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
                setListings(prev => [...prev, ...fetchedData]);
            }
        } catch (error) {
            console.error("Search Error", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        setPage(0);
        performSearch(0);
    }, [activeQuery, categoryId, locationId, filterTrigger]);

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
            <View className="bg-white px-4 pt-2 pb-4 border-b border-gray-100 z-10">

                {/* Main Input with Back Button */}
                <View className="flex-row items-center mb-4 mt-2">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="mr-1 p-1 rounded-full active:bg-gray-100"
                    >
                        <ChevronLeft color="#1f2937" size={32} />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-300 rounded-full h-12 px-4 shadow-sm">
                        <Search className="text-gray-400 mr-2" size={20} />
                        <TextInput
                            className="flex-1 text-base text-text"
                            style={{ paddingVertical: 0, height: '100%' }}
                            placeholder="Buscar tractores, vacas, aperos..."
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
                                className="ml-2 bg-gray-300 rounded-full w-6 h-6 items-center justify-center shadow-sm"
                            >
                                <X color="#374151" size={14} strokeWidth={3} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Chips Container */}
                <View className="flex-row items-center justify-between" style={{ gap: 8 }}>
                    {/* Filtros Button */}
                    <TouchableOpacity
                        onPress={() => setIsFiltersModalOpen(true)}
                        className={`flex-row items-center justify-center px-3 h-10 rounded-full border ${priceMin || priceMax ? 'bg-primary-muted border-primary/50' : 'border-gray-400 bg-white'}`}
                        activeOpacity={0.7}
                    >
                        <SlidersHorizontal className={priceMin || priceMax ? "text-primary-hover" : "text-gray-700"} size={16} />
                        <Text className={`ml-1.5 text-[14px] font-medium ${priceMin || priceMax ? "text-primary-hover" : "text-gray-800"}`}>Filtros</Text>
                    </TouchableOpacity>

                    {/* Category Scroll/Chip */}
                    <TouchableOpacity
                        onPress={() => setIsCategoryModalOpen(true)}
                        className={`flex-[4] flex-row items-center px-4 h-10 rounded-full border ${categoryId ? 'bg-primary-muted border-primary/50' : 'bg-white border-gray-400'}`}
                    >
                        <Text className={`text-[14px] font-medium ${categoryId ? 'text-primary-hover' : 'text-gray-800'}`} numberOfLines={1}>
                            {categoryId ? getCategoryLabel() : 'Todas las categorías'}
                        </Text>
                    </TouchableOpacity>

                    {/* Location Chip */}
                    <TouchableOpacity
                        onPress={() => setIsLocationModalOpen(true)}
                        className={`flex-[3] flex-row items-center px-4 h-10 rounded-full border ${locationId ? 'bg-primary-muted border-primary/50' : 'bg-white border-gray-400'}`}
                    >
                        <Text className={`text-[14px] font-medium ${locationId ? 'text-primary-hover' : 'text-gray-800'}`} numberOfLines={1}>
                            {locationId ? getLocationLabel() : 'Toda España'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sort Button */}
                <View className="flex-row justify-between items-center mt-4 px-1">
                    <Text className="text-gray-500 font-medium">{listings.length} resultados</Text>
                    <TouchableOpacity className="flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-1.5">
                        <ArrowUpDown className="text-gray-600 mr-1.5" size={14} />
                        <Text className="text-sm font-bold text-gray-700">Relevancia</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results Grid */}
            {loading ? (
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
                        <View className="p-2" style={{ flex: 1, maxWidth: numColumns === 1 ? '100%' : `${100 / numColumns}%` }}>
                            <ListingCard listing={item} />
                        </View>
                    )}
                    contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-6 items-center justify-center">
                                <ActivityIndicator size="small" color="#059669" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center p-12 mt-10">
                            <Search className="text-gray-300 mb-4" size={48} />
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
                onClear={() => {
                    setPriceMin('');
                    setPriceMax('');
                    setCategoryId(null);
                    setLocationId(null);

                    setFilterTrigger(f => f + 1);
                    setIsFiltersModalOpen(false);
                }}
                onApply={() => {
                    setFilterTrigger(f => f + 1);
                    setIsFiltersModalOpen(false);
                }}
            />
        </SafeAreaView>
    );
}
