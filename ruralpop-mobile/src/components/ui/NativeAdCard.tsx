import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export function NativeAdCard() {
    // Usamos tu ID de "Anuncio Nativo" (aunque estemos usando el componente Banner, 
    // en algunas cuentas AdMob permite que un bloque nativo se sirva como banner MREC si se configura).
    // Si falla, tendrías que crear un bloque "Banner" de AdMob para estas posiciones en la consola de AdMob.
    // Usamos el ID del bloque "Banner" que funciona bien arriba
    const adUnitID = __DEV__ ? TestIds.BANNER : "ca-app-pub-2042067618462129/8125550269";

    return (
        <View className="bg-surface rounded-2xl overflow-hidden border border-gray-200 mb-4 shadow-sm items-center justify-center p-2 bg-gray-50 self-center">
            <BannerAd
                unitId={adUnitID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => console.log('Ad loaded successfully')}
                onAdFailedToLoad={(error) => console.log('Ad failed to load: ', error)}
            />
        </View>
    );
}
