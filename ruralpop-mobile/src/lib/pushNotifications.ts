import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../../src/lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export async function registerForPushNotificationsAsync(userId: string) {
    let token;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#059669',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                console.warn('⚠️ No se ha encontrado un EAS projectId en app.json. Las notificaciones Push requieren inicializar EAS con "npx eas init"');
                // Intentamos pedir el token de todos modos con un fallback genérico que podría fallar en SDK >= 50
            }

            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId: projectId || "00000000-0000-0000-0000-000000000000",
                })
            ).data;
            console.log('Expo Push Token guardado:', token);

            // Save the token to the users table
            if (token && userId) {
                const { error } = await supabase
                    .from('users')
                    .update({ expo_push_token: token })
                    .eq('id', userId);

                if (error) console.error("Could not save push token to Supabase:", error);
            }
        } catch (e: any) {
            console.error('❌ Push Token Fetch Error:', e.message || e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
