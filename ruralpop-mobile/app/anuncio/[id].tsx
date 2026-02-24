import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Listing, User } from '../../src/types';
import { ChevronLeft, Share2, Heart, MapPin, Tag, Phone, Mail, ImageIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ExtendedListing extends Listing {
    seller?: User;
}

export default function ListingDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [listing, setListing] = useState<ExtendedListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const formattedPrice = listing.price
        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)
        : 'A consultar';

    const handleCall = () => {
        if (listing.seller?.phone || listing.contact_phone) {
            Linking.openURL(`tel:${listing.seller?.phone || listing.contact_phone}`);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            <ScrollView className="flex-1" bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
                                <Image
                                    key={idx}
                                    source={{ uri: url }}
                                    className="w-full h-full"
                                    style={{ width }}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <ImageIcon size={64} className="text-gray-300 mb-4" />
                            <Text className="text-gray-400 font-medium">Sin imágenes</Text>
                        </View>
                    )}

                    {/* Top Actions overlay */}
                    <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4 pt-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                        >
                            <ChevronLeft color="white" size={24} />
                        </TouchableOpacity>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
                                <Share2 color="white" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
                                <Heart color="white" size={20} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Image Dots Indicator */}
                    {hasImages && listing.image_urls!.length > 1 && (
                        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
                            {listing.image_urls!.map((_, idx) => (
                                <View
                                    key={idx}
                                    className={`h-2 rounded-full ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Content Details */}
                <View className="p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-3xl font-extrabold text-primary">{formattedPrice}</Text>
                        {listing.price_type === 'negotiable' && (
                            <View className="bg-gray-100 px-3 py-1.5 rounded flex-row items-center">
                                <Tag className="text-gray-500 mr-1.5" size={14} />
                                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Negociable</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-2xl font-bold text-text mb-4 leading-tight">{listing.title}</Text>

                    <View className="flex-row items-center bg-surface-muted self-start px-3 py-2 rounded-xl mb-6 border border-gray-100">
                        <MapPin className="text-gray-500 mr-2" size={18} />
                        <Text className="text-text-muted font-medium">
                            {listing.location ? (typeof listing.location === 'object' ? (listing.location as any).name : listing.location) : 'Toda España'}
                        </Text>
                    </View>

                    {/* Seller Info Container */}
                    <View className="bg-primary-muted/20 border border-primary-muted rounded-2xl p-4 mb-8 flex-row items-center">
                        <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4 overflow-hidden border border-gray-100">
                            {listing.seller?.avatar_url ? (
                                <Image source={{ uri: listing.seller.avatar_url }} className="w-full h-full" />
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
                        <Text className="text-text-muted text-base leading-relaxed">
                            {listing.description}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Contact Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => router.push('/messages')}
                    className="flex-1 bg-surface-muted border border-gray-300 py-3.5 rounded-xl flex-row justify-center items-center mr-3"
                    activeOpacity={0.8}
                >
                    <Mail className="text-text mr-2" size={20} />
                    <Text className="text-text font-bold text-base">Mensaje</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleCall}
                    className="flex-1 bg-primary py-3.5 rounded-xl flex-row justify-center items-center ml-3"
                    activeOpacity={0.8}
                >
                    <Phone className="text-white mr-2" size={20} />
                    <Text className="text-white font-bold text-base">Llamar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
