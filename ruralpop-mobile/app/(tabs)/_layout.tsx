import React, { useEffect, useState } from 'react';
import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, Heart, User, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const baseHeight = Platform.OS === 'ios' ? 60 : 60;
    const { user } = useAuth();
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        if (!user) {
            setHasUnread(false);
            return;
        }

        const checkUnread = async () => {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('is_read', false);
            
            setHasUnread(!!(count && count > 0));
        };

        checkUnread();

        const channel = supabase
            .channel(`public:messages:receiver_id=${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
                (payload: any) => {
                    if (!payload.new.is_read) setHasUnread(true);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
                () => checkUnread()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);
    
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
                    tabBarIcon: ({ color }) => (
                        <View>
                            <MessageCircle color={color} size={24} />
                            {hasUnread && (
                                <View style={{ position: 'absolute', top: -2, right: -4, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 1.5, borderColor: '#ffffff' }} />
                            )}
                        </View>
                    ),
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
