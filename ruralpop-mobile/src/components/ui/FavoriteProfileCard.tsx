import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../../lib/image-optimization';
import { Star } from 'lucide-react-native';

interface Props {
    profile: any;
    listings: any[];
    onPress: () => void;
}

export function FavoriteProfileCard({ profile, listings, onPress }: Props) {
    const images = listings.map(l => l.images?.[0]).filter(Boolean);
    const totalListings = listings.length;
    
    // We show 1, 2, or 4 images
    let displayImages = [];
    if (images.length >= 4) {
        displayImages = images.slice(0, 4);
    } else if (images.length >= 2) {
        displayImages = images.slice(0, 2);
    } else if (images.length >= 1) {
        displayImages = images.slice(0, 1);
    }

    return (
        <TouchableOpacity 
            onPress={onPress}
            className="bg-white rounded-xl mb-4 border border-gray-200 overflow-hidden"
            activeOpacity={0.8}
        >
            <View className="h-32 bg-gray-100 flex-row flex-wrap">
                {displayImages.length === 0 && (
                    <View className="flex-1 items-center justify-center bg-gray-50">
                        <Text className="text-gray-400">Sin anuncios</Text>
                    </View>
                )}
                {displayImages.length === 1 && (
                    <Image
                        source={{ uri: getOptimizedImageUrl(displayImages[0], { width: 400 }) || undefined }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                )}
                {displayImages.length === 2 && (
                    <>
                        <Image
                            source={{ uri: getOptimizedImageUrl(displayImages[0], { width: 200 }) || undefined }}
                            style={{ width: '49.5%', height: '100%', marginRight: '1%' }}
                            contentFit="cover"
                        />
                        <Image
                            source={{ uri: getOptimizedImageUrl(displayImages[1], { width: 200 }) || undefined }}
                            style={{ width: '49.5%', height: '100%' }}
                            contentFit="cover"
                        />
                    </>
                )}
                {displayImages.length === 4 && (
                    <>
                        {displayImages.map((img, i) => (
                            <View key={i} style={{ width: '49.5%', height: '49.5%', marginRight: i % 2 === 0 ? '1%' : 0, marginBottom: i < 2 ? '1%' : 0 }}>
                                <Image
                                    source={{ uri: getOptimizedImageUrl(img, { width: 200 }) || undefined }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                                {i === 3 && totalListings > 4 && (
                                    <View className="absolute inset-0 bg-black/50 items-center justify-center">
                                        <Text className="text-white font-bold text-lg">+{totalListings - 4}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </>
                )}
            </View>

            <View className="p-3">
                <Text className="font-bold text-gray-900 text-base mb-1" numberOfLines={1}>
                    {profile.commercial_name || profile.name || "Usuario"}
                </Text>
                <View className="flex-row items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} color="#1f2937" fill="#1f2937" />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
}
