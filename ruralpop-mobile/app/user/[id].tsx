import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { ArrowLeft, BadgeCheck, Heart, Share, UserPlus } from 'lucide-react-native';
import { useFavoriteProfiles } from '../../src/hooks/useFavoriteProfiles';
import { Share as RNShare } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { ListingCard } from '../../src/components/ui/ListingCard';
import { Listing } from '../../src/types';
import { FeaturedCheckoutMobile } from '../../src/components/upload/FeaturedCheckoutMobile';
import { getDefaultTenantFilterString, IS_EQUIPOP } from '../../src/config/tenants';
import ImageViewing from "react-native-image-viewing";

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isFavoriteProfile, toggleFavoriteProfile } = useFavoriteProfiles();

    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [featuredModalVisible, setFeaturedModalVisible] = useState(false);
    const [selectedFeaturedListingId, setSelectedFeaturedListingId] = useState<string | null>(null);
    const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

    const isOwnProfile = currentUser?.id === id;
    
    const handleShare = async () => {
        try {
            await RNShare.share({
                message: `Mira este perfil en ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}: https://${IS_EQUIPOP ? 'equipop' : 'ruralpop'}.es/user/${id}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

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
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        users (name, commercial_name, avatar_url, company_logo_url, role)
                    `)
                    .eq('user_id', id)
                    .eq('status', 'active')
                    .or(getDefaultTenantFilterString())
                    .order('created_at', { ascending: false });

                if (listingsError) {
                    console.error("Error fetching listings:", listingsError);
                }

                if (listingsData) {
                    // map to match the structure ListingCard expects
                    const mappedListings = listingsData.map(l => ({
                        ...l,
                        image_urls: l.image_urls || []
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

    const displayName = profile.commercial_name || profile.name || (IS_EQUIPOP ? 'Usuario Equipop' : 'Usuario Ruralpop');
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
                className="px-4 pb-2 flex-row items-center justify-between bg-white border-b border-gray-100 z-10"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                    <ArrowLeft color="#374151" size={24} />
                </TouchableOpacity>
                
                {!isOwnProfile && (
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => toggleFavoriteProfile(id as string)} className="p-2 mr-2 active:bg-gray-100 rounded-full">
                            <Heart color={isFavoriteProfile(id as string) ? "#ef4444" : "#374151"} fill={isFavoriteProfile(id as string) ? "#ef4444" : "transparent"} size={26} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} className="p-2 active:bg-gray-100 rounded-full">
                            <Share color="#374151" size={24} />
                        </TouchableOpacity>
                    </View>
                )}
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
                        <View className="px-6 pt-4 pb-6 flex-row items-center justify-between border-b border-gray-100 bg-white">
                            <View className="flex-1 pr-4">
                                <Text className="text-[26px] font-extrabold text-text mb-1" numberOfLines={2}>
                                    {displayName}
                                </Text>
                                <Text className="text-text-muted text-[15px]">En {IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} desde {joinedYear}</Text>
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
