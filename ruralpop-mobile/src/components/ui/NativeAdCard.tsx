import React, { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IS_EQUIPOP } from '../../config/tenants';

export function NativeAdCard() {
    const [adFailed, setAdFailed] = useState(false);
    if (IS_EQUIPOP || adFailed) return null;
    
    // Usamos el ID del bloque "Banner" que funciona bien arriba
    const adUnitID = __DEV__ ? TestIds.BANNER : "ca-app-pub-2042067618462129/3189662937";

    return (
        <View 
            className="bg-surface rounded-2xl overflow-hidden border border-gray-200 mb-4 shadow-sm items-center justify-center bg-gray-50 self-center" 
            style={{ minHeight: 250, minWidth: 300 }}
        >
            <BannerAd
                unitId={adUnitID}
                size={BannerAdSize.MEDIUM_RECTANGLE}
                onAdLoaded={() => console.log('Ad loaded successfully')}
                onAdFailedToLoad={(error) => {
                    console.log('Ad failed to load: ', error);
                    setAdFailed(true);
                }}
            />
        </View>
    );
}
