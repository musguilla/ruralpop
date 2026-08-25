import React, { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IS_EQUIPOP } from '../../config/tenants';

export function RectangularBanner() {
    const [adFailed, setAdFailed] = useState(false);
    if (IS_EQUIPOP || adFailed) return null;
    
    // Utilizamos el adUnitID proporcionado por el usuario
    const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-2042067618462129/3189662937';

    return (
        <View className="items-center justify-center w-full my-2">
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.BANNER}
                onAdFailedToLoad={(error) => {
                    console.log('Ad failed to load: ', error);
                    setAdFailed(true);
                }}
            />
        </View>
    );
}
