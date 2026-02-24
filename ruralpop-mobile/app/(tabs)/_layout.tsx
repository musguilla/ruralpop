import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, Heart, User, MessageCircle } from "lucide-react-native";

export default function TabLayout() {
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
                    height: 60,
                    paddingBottom: 12,
                    paddingTop: 4,
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
