import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/contexts/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
