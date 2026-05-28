import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Alert, Share as RNShare, Platform, Modal, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { Listing, User } from '../../src/types';
import { ChevronLeft, Share as ShareIcon, Heart, MapPin, Tag, Phone, Mail, ImageIcon, X, ShieldCheck, Layers } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { formatPrice } from '../../src/lib/formatters';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';
import { calculateRuralpopFee } from '../../src/lib/escrow';
import { buildWebListingUrl } from '../../src/lib/urls';
import { getDefaultTenantFilterString } from '../../src/config/tenants';
import { RectangularBanner } from '../../src/components/ui/RectangularBanner';

const { width, height } = Dimensions.get('window');

interface ExtendedListing extends Listing {
    seller?: User & { zoo_register_number?: string };
}

export default function ListingDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const insets = useSafeAreaInsets();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const isFavorited = id ? favorites.has(id) : false;

    const handleFavoritePress = () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (id) {
            toggleFavorite(id);
            setLikesCount(prev => prev !== undefined ? (isFavorited ? Math.max(0, prev - 1) : prev + 1) : 1);
        }
    };

    const [listing, setListing] = useState<ExtendedListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isCheckoutSummaryVisible, setIsCheckoutSummaryVisible] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [likesCount, setLikesCount] = useState<number | undefined>(undefined);

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
            seller:users (id, name, avatar_url, created_at, role, commercial_name),
            favorites (count)
          `)
                    .eq('id', id)
                    .or(getDefaultTenantFilterString())
                    .single();

                if (error) throw error;
                setListing(data as ExtendedListing);
                
                // Set initial likes count
                if (data.favorites && Array.isArray(data.favorites) && data.favorites.length > 0) {
                    setLikesCount(data.favorites[0].count);
                } else {
                    setLikesCount(0);
                }
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

    const isProfessional = listing.seller?.role === 'profesional';
    const rawSellerName = isProfessional && listing.seller?.commercial_name ? listing.seller.commercial_name : (listing.seller?.name || "Usuario Ruralpop");

    const handleCall = () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        const phone = listing.seller?.phone || listing.contact_phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`).catch((err) => {
                Alert.alert("Error", "No se pudo abrir la aplicación de teléfono.");
            });
        }
    };

    const handleShare = () => {
        if (!listing) return;
        const url = buildWebListingUrl(listing.id, listing.title);
        const message = Platform.OS === 'ios'
            ? `Mira este anuncio en Ruralpop: ${listing.title}`
            : `Mira este anuncio en Ruralpop: ${listing.title}\n${url}`;

        setTimeout(() => {
            RNShare.share({
                message,
                url: Platform.OS === 'ios' ? url : undefined,
                title: listing.title,
            }).catch((error) => {
                console.log('Error sharing:', error);
            });
        }, 100);
    };

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setGalleryInitialIndex(index);
        setIsGalleryOpen(true);
    };

    const handleBuy = async () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }

        try {
            setIsCheckingOut(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            const siteUrl = __DEV__ && process.env.EXPO_PUBLIC_SITE_URL ? process.env.EXPO_PUBLIC_SITE_URL : 'https://www.ruralpop.com';
            
            const res = await fetch(`${siteUrl}/api/checkout/escrow/native`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ listingId: listing!.id })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Error al procesar el pago.');
            }

            const { paymentIntentClientSecret } = await res.json();

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Ruralpop',
                paymentIntentClientSecret,
                allowsDelayedPaymentMethods: false,
                defaultBillingDetails: {
                    name: user.user_metadata?.full_name || 'Usuario Ruralpop',
                }
            });

            if (initError) {
                throw new Error(initError.message);
            }

            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    // Usuario canceló, no hacer nada
                    return;
                }
                throw new Error(paymentError.message);
            }

            // Éxito
            Alert.alert('¡Pago completado!', 'Tu pedido ha sido realizado con éxito.');
            setIsCheckoutSummaryVisible(false);
            router.replace('/compras');

        } catch (error: any) {
            Alert.alert('Atención', error.message || 'No se pudo iniciar el proceso de compra.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            {/* Header Overlay */}
            <View 
                className="absolute top-0 left-0 right-0 z-10" 
                style={{ paddingTop: Math.max(insets.top, 16) }} 
                pointerEvents="box-none"
            >
                <View style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isScrolled ? 'white' : 'transparent',
                    borderBottomWidth: isScrolled ? 1 : 0,
                    borderColor: '#e5e7eb'
                }} pointerEvents="none" />
                
                <View className="flex-row justify-between items-center px-4 py-2" pointerEvents="box-none">
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
            </View>

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

                    {/* Likes Badge (Interactive) */}
                    {likesCount !== undefined && likesCount >= 0 && (
                        <TouchableOpacity 
                            onPress={handleFavoritePress} 
                            className="absolute bottom-4 right-4 bg-[#e4e5db] px-4 py-2.5 rounded-full flex-row items-center justify-center shadow-sm"
                            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                        >
                            <Heart 
                                color={isFavorited ? "#ef4444" : "#111827"} 
                                fill={isFavorited ? "#ef4444" : "transparent"} 
                                size={20} 
                            />
                            <Text className="font-bold text-gray-900 ml-2 text-base">{likesCount}</Text>
                        </TouchableOpacity>
                    )}
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

                    <View className="flex-row flex-wrap gap-2 mb-6">
                        <View className="flex-row items-center bg-surface-muted px-3 py-2 rounded-xl border border-gray-100">
                            <MapPin color="#6b7280" size={18} />
                            <Text className="text-text-muted font-medium ml-1">
                                {listing.location ? (typeof listing.location === 'object' ? (listing.location as any).name : listing.location) : 'Toda España'}
                            </Text>
                        </View>

                        {listing.subcategory && (
                            <View className="flex-row items-center bg-surface-muted px-3 py-2 rounded-xl border border-gray-100">
                                <Layers color="#6b7280" size={18} />
                                <Text className="text-text-muted font-medium ml-1 capitalize">
                                    {listing.subcategory}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Seller Info Container */}
                    <View className="bg-primary-muted/10 border border-gray-200 rounded-2xl p-4 mb-8 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-3 overflow-hidden border border-gray-100">
                                {listing.seller?.avatar_url ? (
                                    <Image source={{ uri: getOptimizedImageUrl(listing.seller.avatar_url, { width: 100 }) || undefined }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                                ) : (
                                    <Text className="text-xl font-bold text-primary">
                                        {rawSellerName.charAt(0) || 'U'}
                                    </Text>
                                )}
                            </View>
                            <View className="flex-1 pr-2">
                                <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Vendedor</Text>
                                <View className="flex-row items-center flex-wrap">
                                    <Text className="text-lg font-bold text-text mr-1" numberOfLines={1}>{rawSellerName}</Text>
                                    {isProfessional && <ShieldCheck color="#059669" size={16} />}
                                </View>
                                {isProfessional && (
                                    <Text className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">Ver más anuncios</Text>
                                )}
                                {listing.seller?.zoo_register_number && (
                                    <View className="mt-1 flex-row items-center bg-[#059669]/10 self-start px-2 py-1 rounded border border-[#059669]/20">
                                        <ShieldCheck color="#059669" size={12} />
                                        <Text className="text-[10px] text-[#059669] font-bold ml-1">Reg. Zoológico: {listing.seller.zoo_register_number}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        {listing.vender_online && (
                            <TouchableOpacity
                                onPress={() => {
                                    if (!user) {
                                        router.push('/(auth)/login');
                                        return;
                                    }
                                    if (listing?.user_id) {
                                        router.push({
                                            pathname: '/messages/chat',
                                            params: { 
                                                listingId: id, 
                                                otherUserId: listing.user_id,
                                                listingTitle: listing.title,
                                                listingImage: listing.image_urls?.[0] || '',
                                                listingPrice: listing.price?.toString() || '0',
                                                otherUserName: rawSellerName,
                                                otherUserAvatar: listing.seller?.avatar_url || ''
                                            }
                                        });
                                    }
                                }}
                                className="bg-white border border-gray-300 px-4 py-2.5 rounded-full flex-row items-center justify-center"
                            >
                                <Mail color="#4b5563" size={16} />
                                <Text className="text-gray-700 font-bold text-sm ml-1.5">Chat</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="border-t border-gray-100 pt-6">
                        <Text className="text-xl font-bold text-text mb-4">Descripción</Text>
                        <Text className="text-text-muted text-[17px] leading-relaxed">
                            {listing.description}
                        </Text>
                    </View>

                    {/* Ad Unit & Edited Date */}
                    <View className="mt-8 mb-4">
                        <View className="w-full items-center justify-center bg-gray-50/50 mb-6 rounded-xl overflow-hidden">
                            <RectangularBanner />
                        </View>
                        <View className="border-t border-gray-200 pt-4 flex-row items-center">
                            <Text className="text-gray-500 text-sm">
                                Editado el {new Date((listing as any).updated_at || listing.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Contact Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 flex-row justify-between items-center">
                {listing.vender_online ? (
                    <TouchableOpacity
                        onPress={() => {
                            if (!user) {
                                router.push('/(auth)/login');
                                return;
                            }
                            if (user?.id === listing.user_id) {
                                Alert.alert("Aviso", "No puedes comprar tu propio producto.");
                                return;
                            }
                            if (!user?.user_metadata?.shipping_address) {
                                router.push({
                                    pathname: '/edit-shipping-address',
                                    params: { returnToCheckout: 'true' }
                                });
                                return;
                            }
                            setIsCheckoutSummaryVisible(true);
                        }}
                        disabled={isCheckingOut}
                        className="w-full bg-primary py-4 rounded-full flex-row justify-center items-center shadow-sm"
                        activeOpacity={0.8}
                    >
                        {isCheckingOut ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <ShieldCheck color="#ffffff" size={20} />
                                <Text className="text-white font-bold text-lg ml-2">Comprar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row justify-between w-full" style={{ gap: 12 }}>
                        {hasPhone && (
                            <TouchableOpacity
                                onPress={handleCall}
                                className="flex-1 flex-row justify-center items-center py-4 rounded-full bg-white border-2 border-primary"
                                activeOpacity={0.8}
                            >
                                <Phone color="#059669" size={20} />
                                <Text className="text-primary font-bold text-lg ml-2">Llamar</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => {
                                if (!user) {
                                    router.push('/(auth)/login');
                                    return;
                                }
                                if (listing?.user_id) {
                                    router.push({
                                        pathname: '/messages/chat',
                                        params: { 
                                            listingId: id, 
                                            otherUserId: listing.user_id,
                                            listingTitle: listing.title,
                                            listingImage: listing.image_urls?.[0] || '',
                                            listingPrice: listing.price?.toString() || '0',
                                            otherUserName: rawSellerName,
                                            otherUserAvatar: listing.seller?.avatar_url || ''
                                        }
                                    });
                                }
                            }}
                            className="flex-1 flex-row justify-center items-center py-4 rounded-full bg-primary shadow-sm"
                            activeOpacity={0.8}
                        >
                            <Mail color="#ffffff" size={20} />
                            <Text className="text-white font-bold text-lg ml-2">Chat</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Checkout Summary Modal */}
            <Modal
                visible={isCheckoutSummaryVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsCheckoutSummaryVisible(false)}
            >
                <SafeAreaView className="flex-1 bg-surface-muted">
                    <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between z-10">
                        <View className="flex-row items-center">
                            <ShieldCheck color="#059669" size={26} />
                            <Text className="text-xl font-bold text-text ml-2">Pago seguro</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setIsCheckoutSummaryVisible(false)}
                            className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center"
                        >
                            <ChevronLeft color="#4b5563" size={18} />
                            <Text className="text-gray-700 font-bold ml-1">Cancelar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 py-6">
                        <View className="bg-white rounded-2xl border border-gray-300 p-6 mb-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-[17px] text-gray-500">Producto</Text>
                                <Text className="text-[17px] text-text">{formatPrice((listing.price || 0))}</Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-[17px] text-gray-500">Envío</Text>
                                <Text className="text-[17px] text-text">
                                    {formatPrice(listing.shipping_price || 0)}
                                </Text>
                            </View>

                            <Text className="text-[13px] text-gray-500 mb-6 mt-2">
                                Las compras están cubiertas por la Protección Ruralpop
                            </Text>

                            <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
                                <Text className="text-xl font-extrabold text-text">Total a pagar</Text>
                                <Text className="text-2xl font-extrabold text-text">
                                    {formatPrice((listing.price || 0) + (listing.shipping_price || 0) + (calculateRuralpopFee(Math.round((listing.price || 0) * 100)) / 100))}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View className="bg-white border-t border-gray-200 p-4 pb-8">
                        <TouchableOpacity
                            onPress={handleBuy}
                            disabled={isCheckingOut}
                            className="w-full bg-primary py-4 rounded-full flex-row justify-center items-center shadow-sm"
                            activeOpacity={0.8}
                        >
                            {isCheckingOut ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <ShieldCheck color="#ffffff" size={20} />
                                    <Text className="text-white font-bold text-lg ml-2">
                                        Pagar {formatPrice((listing.price || 0) + (listing.shipping_price || 0) + (calculateRuralpopFee(Math.round((listing.price || 0) * 100)) / 100))}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

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
