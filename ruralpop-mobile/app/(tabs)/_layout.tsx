import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, Heart, User, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const baseHeight = Platform.OS === 'ios' ? 60 : 60;
    
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#059669",
                tabBarInactiveTintColor: "#6b7280",
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    backgroundColor: "#ffffff",
                    height: baseHeight + insets.bottom,
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom + 12 : insets.bottom + 10,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Buscar",
                    tabBarIcon: ({ color }) => <Search color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favoritos",
                    tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="publish"
                options={{
                    title: "Vender",
                    tabBarIcon: ({ color }) => <PlusCircle color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: "Mensajes",
                    // Use a message icon, assuming 'MessageCircle' or similar is available from lucide. Re-importing at top.
                    tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color }) => <User color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}
