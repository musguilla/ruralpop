import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MapPin, Heart, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react-native';
import { Listing } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

interface ListingCardProps {
    listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
    const { user } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const router = useRouter();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasImages = listing.image_urls && listing.image_urls.length > 0;
    const mainImage = hasImages ? listing.image_urls![currentImageIndex] : null;

    const isFavorited = favorites.has(listing.id);

    const handleFavoritePress = () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        toggleFavorite(listing.id);
    };

    const nextImage = () => {
        if (listing.image_urls) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.image_urls!.length);
        }
    };

    const prevImage = () => {
        if (listing.image_urls) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.image_urls!.length) % listing.image_urls!.length);
        }
    };

    // Safe formatting for price
    const formattedPrice = listing.price
        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)
        : 'A consultar';

    return (
        <Link href={`/anuncio/${listing.id}`} asChild>
            <TouchableOpacity activeOpacity={0.9} className="bg-surface rounded-2xl overflow-hidden border border-gray-200 mb-4 shadow-sm w-[100%] max-w-[400px]">
                {/* Image Section */}
                <View className="relative w-full bg-surface-muted items-center justify-center overflow-hidden" style={{ aspectRatio: 4 / 3 }}>
                    {mainImage ? (
                        <Image
                            source={{ uri: mainImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="items-center justify-center">
                            <ImageIcon className="text-gray-400 mb-2" size={40} />
                            <Text className="text-gray-400 text-xs text-center font-medium">Sin imagen</Text>
                        </View>
                    )}

                    {/* Slider Controls */}
                    {hasImages && listing.image_urls!.length > 1 && (
                        <>
                            <TouchableOpacity
                                onPress={prevImage}
                                className="absolute top-1/2 -mt-4 w-8 h-8 rounded-full bg-black/30 items-center justify-center z-10"
                                style={{ left: 8 }}
                            >
                                <ChevronLeft color="white" size={20} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={nextImage}
                                className="absolute top-1/2 -mt-4 w-8 h-8 rounded-full bg-black/30 items-center justify-center z-10"
                                style={{ right: 8 }}
                            >
                                <ChevronRight color="white" size={20} />
                            </TouchableOpacity>

                            {/* Dots */}
                            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center space-x-1.5">
                                {listing.image_urls!.map((_, idx) => (
                                    <View
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                ))}
                            </View>
                        </>
                    )}

                </View>

                {/* Favorite Button Overlay on top-right of the image */}
                <TouchableOpacity
                    onPress={handleFavoritePress}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 20 }}
                >
                    <Heart color={isFavorited ? "#ef4444" : "white"} fill={isFavorited ? "#ef4444" : "transparent"} size={18} />
                </TouchableOpacity>

                {/* Content Section */}
                <View className="p-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-bold text-primary">{formattedPrice}</Text>
                        {listing.price_type === 'negotiable' && (
                            <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Negociable</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-text font-bold text-lg mb-2 leading-tight" numberOfLines={2}>
                        {listing.title}
                    </Text>

                    <View className="flex-row items-center justify-between mt-auto">
                        <View className="flex-row items-center flex-1 mr-2">
                            <MapPin className="text-gray-400 mr-1" size={14} />
                            <Text className="text-sm text-text-muted truncate flex-1" numberOfLines={1}>
                                {listing.location ? (typeof listing.location === 'object' ? (listing.location as any).name : listing.location) : 'Toda España'}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-400">
                            {new Date(listing.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Former Favorite Button Location */}
            </TouchableOpacity>
        </Link>
    );
}
