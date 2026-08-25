import "react-native-reanimated";
import "../global.css";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { AuthProvider } from "../src/contexts/AuthContext";
import { FavoritesProvider } from "../src/contexts/FavoritesContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
    useEffect(() => {
        (async () => {
            try {
                // Delay the request by 1 second to ensure the app is fully active in iOS.
                // If called too early during splash screen, iOS silently drops the prompt.
                await new Promise(resolve => setTimeout(resolve, 1000));
                await requestTrackingPermissionsAsync();
            } catch (e) {
                console.warn("Failed to request tracking permissions", e);
            }
        })();
    }, []);

    const router = useRouter();
    const lastNotificationResponse = Notifications.useLastNotificationResponse();

    useEffect(() => {
        if (
            lastNotificationResponse &&
            lastNotificationResponse.notification.request.content.data
        ) {
            const data = lastNotificationResponse.notification.request.content.data as any;

            if (data.url) {
                // If it contains a URL (like /ventas or /anuncio/123)
                router.push(data.url);
            } else if (data.listingId && data.otherUserId) {
                // Legacy Chat Notification Format
                router.push({
                    pathname: '/messages/chat',
                    params: {
                        listingId: data.listingId,
                        otherUserId: data.otherUserId,
                    }
                });
            }
        }
    }, [lastNotificationResponse]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}>
                <AuthProvider>
                    <FavoritesProvider>
                        <StatusBar style="auto" />
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
                            <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
                        </Stack>
                    </FavoritesProvider>
                </AuthProvider>
            </StripeProvider>
        </GestureHandlerRootView>
    );
}
