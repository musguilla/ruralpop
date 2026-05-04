import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Alert, Share as RNShare, Platform, Modal, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { Listing, User } from '../../src/types';
import { ChevronLeft, Share as ShareIcon, Heart, MapPin, Tag, Phone, Mail, ImageIcon, X } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { formatPrice } from '../../src/lib/formatters';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface ExtendedListing extends Listing {
    seller?: User;
}

export default function ListingDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const insets = useSafeAreaInsets();

    const isFavorited = id ? favorites.has(id) : false;

    const handleFavoritePress = () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (id) toggleFavorite(id);
    };

    const [listing, setListing] = useState<ExtendedListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Scroll Animation - Simplified to avoid Animated/Native driver crashes
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        async function fetchListingDetails() {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
            *,
            seller:users (id, name, avatar_url, created_at)
          `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setListing(data as ExtendedListing);
            } catch (error) {
                console.error('Error fetching listing details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchListingDetails();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-surface">
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    if (!listing) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <Text className="text-xl font-bold text-text mb-4">Anuncio no encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const hasImages = listing.image_urls && listing.image_urls.length > 0;

    const formattedPrice = formatPrice(listing.price);

    const hasPhone = !!(listing.seller?.phone || listing.contact_phone);

    const handleCall = () => {
        const phone = listing.seller?.phone || listing.contact_phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`).catch((err) => {
                Alert.alert("Error", "No se pudo abrir la aplicación de teléfono.");
            });
        }
    };

    const handleShare = async () => {
        if (!listing) return;
        try {
            const url = `https://ruralpop.com/anuncio/${listing.id}`;
            await RNShare.share({
                message: Platform.OS === 'ios'
                    ? `Mira este anuncio en Ruralpop: ${listing.title}`
                    : `Mira este anuncio en Ruralpop: ${listing.title}\n${url}`,
                url: Platform.OS === 'ios' ? url : undefined,
                title: listing.title,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setGalleryInitialIndex(index);
        setIsGalleryOpen(true);
    };

    return (
        <View className="flex-1 bg-surface">
            {/* Header Overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-10" edges={['top']}>
                <View style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isScrolled ? 'white' : 'transparent',
                    borderBottomWidth: isScrolled ? 1 : 0,
                    borderColor: '#e5e7eb'
                }} />
                
                <View className="flex-row justify-between items-center px-4 py-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={`w-10 h-10 rounded-full items-center justify-center ${isScrolled ? 'bg-gray-100' : 'bg-black/30'}`}
                    >
                        <ChevronLeft color={isScrolled ? "#111827" : "white"} size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleShare} className={`w-10 h-10 rounded-full items-center justify-center ${isScrolled ? 'bg-gray-100' : 'bg-black/30'}`}>
                        <ShareIcon color={isScrolled ? "#111827" : "white"} size={20} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView 
                className="flex-1" 
                bounces={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={(e) => {
                    const y = e.nativeEvent.contentOffset.y;
                    setIsScrolled(y > width * 0.5);
                }}
                scrollEventThrottle={16}
            >
                {/* Header Images */}
                <View className="relative w-full aspect-square bg-surface-muted">
                    {hasImages ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                        >
                            {listing.image_urls!.map((url, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    activeOpacity={0.9} 
                                    onPress={() => openGallery(idx)}
                                    style={{ width, height: width }}
                                >
                                    <Image
                                        source={{ uri: getOptimizedImageUrl(url, { width: 800 }) || undefined }}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <ImageIcon size={64} color="#d1d5db" />
                            <Text className="text-gray-400 font-medium">Sin imágenes</Text>
                        </View>
                    )}

                    {/* Image Counter Badge (Bottom Left) */}
                    {hasImages && listing.image_urls!.length > 1 && (
                        <View className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                            <Text className="text-white font-bold text-sm tracking-wider">
                                {currentImageIndex + 1}/{listing.image_urls!.length}
                            </Text>
                        </View>
                    )}

                    {/* Favorite Button Overlay (Bottom Right) */}
                    <TouchableOpacity 
                        onPress={handleFavoritePress} 
                        className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg pt-0.5"
                        style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                    >
                        <Heart color={isFavorited ? "#ef4444" : "#111827"} fill={isFavorited ? "#ef4444" : "transparent"} size={22} />
                    </TouchableOpacity>
                </View>

                {/* Content Details */}
                <View className="p-6">
                    {/* Title first */}
                    <Text className="text-3xl font-extrabold text-text mb-2 leading-tight">{listing.title}</Text>
                    
                    {/* Price & Negotiable Row */}
                    <View className="flex-row justify-start items-center mb-6">
                        <Text className="text-2xl font-extrabold text-primary mr-3">{formattedPrice}</Text>
                        {listing.price_type === 'negotiable' && (
                            <View className="bg-gray-100 px-3 py-1.5 rounded flex-row items-center">
                                <Tag color="#6b7280" size={14} />
                                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Negociable</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center bg-surface-muted self-start px-3 py-2 rounded-xl mb-6 border border-gray-100">
                        <MapPin color="#6b7280" size={18} />
                        <Text className="text-text-muted font-medium ml-1">
                            {listing.location ? (typeof listing.location === 'object' ? (listing.location as any).name : listing.location) : 'Toda España'}
                        </Text>
                    </View>

                    {/* Seller Info Container */}
                    <View className="bg-primary-muted/10 border border-gray-200 rounded-2xl p-4 mb-8 flex-row items-center">
                        <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4 overflow-hidden border border-gray-100">
                            {listing.seller?.avatar_url ? (
                                <Image source={{ uri: getOptimizedImageUrl(listing.seller.avatar_url, { width: 100 }) || undefined }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                            ) : (
                                <Text className="text-xl font-bold text-primary">
                                    {listing.seller?.name?.charAt(0) || 'U'}
                                </Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Vendedor</Text>
                            <Text className="text-lg font-bold text-text">{listing.seller?.name || 'Usuario Ruralpop'}</Text>
                        </View>
                    </View>

                    <View className="border-t border-gray-100 pt-6">
                        <Text className="text-xl font-bold text-text mb-4">Descripción</Text>
                        <Text className="text-text-muted text-[17px] leading-relaxed">
                            {listing.description}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Contact Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 flex-row justify-between items-center">
                {hasPhone ? (
                    <>
                        <TouchableOpacity
                            onPress={() => {
                                if (!user) {
                                    router.push('/(auth)/login');
                                    return;
                                }
                                if (listing?.user_id) {
                                    router.push({
                                        pathname: '/messages/chat',
                                        params: { listingId: id, otherUserId: listing.user_id }
                                    });
                                }
                            }}
                            className={`bg-surface-muted border border-gray-300 py-3.5 rounded-xl flex-row justify-center items-center flex-1 mr-3`}
                            activeOpacity={0.8}
                        >
                            <Mail color="#111827" size={20} />
                            <Text className="text-text font-bold text-base ml-2">Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleCall}
                            className="flex-1 bg-primary py-3.5 rounded-xl flex-row justify-center items-center ml-3"
                            activeOpacity={0.8}
                        >
                            <Phone color="#ffffff" size={20} />
                            <Text className="text-white font-bold text-base ml-2">Llamar</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    // Only Chat Button -> Pill shaped Ruralpop Green
                    <TouchableOpacity
                        onPress={() => {
                            if (!user) {
                                router.push('/(auth)/login');
                                return;
                            }
                            if (listing?.user_id) {
                                router.push({
                                    pathname: '/messages/chat',
                                    params: { listingId: id, otherUserId: listing.user_id }
                                });
                            }
                        }}
                        className={`w-full bg-primary py-4 rounded-full flex-row justify-center items-center shadow-sm`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">Chat</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Fullscreen Interactive Gallery Modal */}
            <ImageViewing
                images={listing.image_urls?.map(url => ({ uri: getOptimizedImageUrl(url, { width: 1200 }) || url })) || []}
                imageIndex={galleryInitialIndex}
                visible={isGalleryOpen}
                onRequestClose={() => setIsGalleryOpen(false)}
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
                onImageIndexChange={(index) => setCurrentImageIndex(index)}
                HeaderComponent={() => (
                    <View style={{ paddingTop: Math.max(insets.top, 20), paddingRight: 20, alignItems: 'flex-end', pointerEvents: 'box-none' }}>
                        <TouchableOpacity onPress={() => setIsGalleryOpen(false)} className="w-10 h-10 items-center justify-center">
                            <X color="white" size={32} />
                        </TouchableOpacity>
                    </View>
                )}
                FooterComponent={({ imageIndex }) => (
                    <View style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                        <Text className="text-white text-center font-bold text-lg tracking-widest mb-4">
                            {imageIndex + 1} / {listing.image_urls?.length || 0}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {listing.image_urls?.map((url, idx) => (
                                <View key={idx} className={`w-16 h-16 mr-3 rounded-xl overflow-hidden border-2 ${imageIndex === idx ? 'border-white' : 'border-transparent opacity-50'}`}>
                                    <Image source={{ uri: getOptimizedImageUrl(url, { width: 150 }) || undefined }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
            />
        </View>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se rediseña el componente de detalle simulando UI tipo Wallapop.
 * - Animación del Header: Simplificada usando ScrollView normal y un fondo blanco sólido cuando el usuario hace scroll hacia abajo para evitar conflictos/crashes entre gestos y Animated con NativeDriver falso.
 * - Componente `Modal`: Se introduce una galería a pantalla completa. Usamos `expo-image` con URLs optimizadas en vez de `RNImage` (core react-native) para evitar picos de uso de RAM que causaban Memory Crashes por imágenes gigantes (raw).
 * - Iconos/Badges: Posición absolute bottom-right para favorito (sin cuenta, shadow suave) y bottom-left contador oscuro semitransparente.
 */
