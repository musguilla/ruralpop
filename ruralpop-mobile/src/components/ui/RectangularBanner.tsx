import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export function RectangularBanner() {
    // Utilizamos el adUnitID proporcionado por el usuario
    const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-2042067618462129/3189662937';

    return (
        <View className="items-center justify-center py-4 w-full bg-surface-muted">
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.MEDIUM_RECTANGLE}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    );
}
