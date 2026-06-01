import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { ArrowLeft, BadgeCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { Listing } from '../../src/types';
import { FeaturedCheckoutMobile } from '../../src/components/upload/FeaturedCheckoutMobile';
import { getDefaultTenantFilterString } from '../../src/config/tenants';
import ImageViewing from "react-native-image-viewing";

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [featuredModalVisible, setFeaturedModalVisible] = useState(false);
    const [selectedFeaturedListingId, setSelectedFeaturedListingId] = useState<string | null>(null);
    const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

    const isOwnProfile = currentUser?.id === id;

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch profile
                const { data: userData } = await supabase
                    .from('users')
                    .select('name, commercial_name, avatar_url, role, company_logo_url, created_at')
                    .eq('id', id)
                    .single();
                
                if (userData) {
                    setProfile(userData);
                }

                // Fetch listings
                const { data: listingsData } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        listing_images (image_url, "order"),
                        users (name, commercial_name, avatar_url, company_logo_url, role)
                    `)
                    .eq('user_id', id)
                    .eq('status', 'active')
                    .or(getDefaultTenantFilterString())
                    .order('created_at', { ascending: false });

                if (listingsData) {
                    // map to match the structure ListingCard expects
                    const mappedListings = listingsData.map(l => ({
                        ...l,
                        image_urls: l.listing_images?.sort((a: any, b: any) => a.order - b.order).map((img: any) => img.image_url) || []
                    })) as unknown as Listing[];
                    setListings(mappedListings);
                }
            } catch (error) {
                console.error("Error loading user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#111827" />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <Text className="text-text font-bold">Usuario no encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-gray-100 px-6 py-3 rounded-full">
                    <Text className="font-bold text-gray-700">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const displayName = profile.commercial_name || profile.name || 'Usuario Ruralpop';
    const avatarUrl = profile.company_logo_url || profile.avatar_url;
    const joinedYear = profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

    const handleFeatureListing = (listingId: string) => {
        setSelectedFeaturedListingId(listingId);
        setFeaturedModalVisible(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-surface">
            {/* Header */}
            <View 
                className="px-4 pb-4 flex-row items-center border-b border-gray-100 bg-white"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                    <ArrowLeft color="#374151" size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListHeaderComponent={() => (
                    <View>
                        {/* Profile Info */}
                        <View className="px-6 py-8 flex-row items-center justify-between border-b border-gray-100 bg-white">
                            <View className="flex-1 pr-4">
                                <Text className="text-[26px] font-extrabold text-text mb-1" numberOfLines={2}>
                                    {displayName}
                                </Text>
                                <Text className="text-text-muted text-[15px]">En Ruralpop desde {joinedYear}</Text>
                            </View>
                            
                            <View className="relative">
                                {avatarUrl ? (
                                    <TouchableOpacity 
                                        onPress={() => setIsAvatarExpanded(true)}
                                        className="border border-gray-200 bg-white overflow-hidden"
                                        style={{ width: 84, height: 84, borderRadius: 42 }}
                                    >
                                        <Image
                                            source={{ uri: getOptimizedImageUrl(avatarUrl) || avatarUrl }}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <View className="w-[84px] h-[84px] bg-primary-muted rounded-full items-center justify-center border border-primary/10">
                                        <Text className="text-[36px] font-bold text-primary uppercase">
                                            {(displayName || 'U').charAt(0)}
                                        </Text>
                                    </View>
                                )}
                                
                                {profile.role === 'profesional' && (
                                    <View className="absolute bottom-0 -right-1 bg-white rounded-full border border-gray-50 shadow-sm items-center justify-center" style={{ width: 28, height: 28 }}>
                                        <BadgeCheck color="#3b82f6" fill="#3b82f6" size={24} stroke="#ffffff" strokeWidth={2} /> 
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Tabs */}
                        <View className="flex-row border-b border-gray-200 px-6 mt-2 mb-4">
                            <View className="py-3 border-b-2 border-[#059669] px-2">
                                <Text className="text-center text-lg font-bold text-text">{listings.length}</Text>
                                <Text className="text-center text-sm font-semibold text-text">En venta</Text>
                            </View>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={{ width: '48%', marginBottom: 16 }}>
                        <ListingCard 
                            listing={item} 
                            isSingleColumn={false}
                            showFeatureButton={isOwnProfile}
                            onFeaturePress={() => handleFeatureListing(item.id)}
                        />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-12 px-6">
                        <Text className="text-lg font-bold text-text mb-2">Sin anuncios</Text>
                        <Text className="text-text-muted text-center">Este usuario no tiene ningún anuncio activo en este momento.</Text>
                    </View>
                )}
            />

            {/* Modal de Pago para Destacar Anuncio */}
            <Modal
                visible={featuredModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setFeaturedModalVisible(false);
                    setSelectedFeaturedListingId(null);
                }}
            >
                {selectedFeaturedListingId && (
                    <FeaturedCheckoutMobile 
                        listingId={selectedFeaturedListingId} 
                        onSkip={() => {
                            setFeaturedModalVisible(false);
                            setSelectedFeaturedListingId(null);
                        }} 
                        isFromVentas={true} // Reutilizamos este flag para el título del modal
                    />
                )}
            </Modal>

            {/* Avatar Fullscreen Viewer */}
            {avatarUrl && (
                <ImageViewing
                    images={[{ uri: getOptimizedImageUrl(avatarUrl, { width: 1200 }) || avatarUrl }]}
                    imageIndex={0}
                    visible={isAvatarExpanded}
                    onRequestClose={() => setIsAvatarExpanded(false)}
                    swipeToCloseEnabled={true}
                />
            )}
        </SafeAreaView>
    );
}
