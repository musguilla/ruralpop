import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Bell } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
    data: any;
}

export default function NotificationsList() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetching, setFetching] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchNotifications();
            }
        }, [user])
    );

    async function fetchNotifications() {
        if (!user) return;
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setFetching(false);
        }
    }

    async function markAsReadAndNavigate(notification: Notification) {
        if (!notification.is_read) {
            try {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', notification.id);
                
                // Optimistic update
                setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            } catch (e) {
                console.error("Failed to mark notification as read", e);
            }
        }

        // Navigate based on data URL if present
        if (notification.data?.url) {
            router.push(notification.data.url as any);
        }
    }

    const renderEmpty = () => (
        <View className="flex-1 justify-center items-center p-8 mt-10">
            <Bell className="text-gray-300 mb-4" size={56} />
            <Text className="text-xl font-bold text-text mb-2">Sin notificaciones</Text>
            <Text className="text-gray-500 text-center text-base">
                Aquí aparecerán tus notificaciones sobre ventas, compras y favoritos.
            </Text>
        </View>
    );

    if (fetching) {
        return (
            <View className="flex-1 justify-center items-center mt-10">
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => markAsReadAndNavigate(item)}
                    className={`px-4 py-4 border-b border-gray-100 flex-row items-start ${item.is_read ? 'bg-white' : 'bg-primary/5'}`}
                >
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.is_read ? 'bg-gray-100' : 'bg-primary/20'}`}>
                        <Bell color={item.is_read ? "#9ca3af" : "#059669"} size={24} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row justify-between items-start mb-1">
                            <Text className={`text-[15px] flex-1 mr-2 ${item.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                {item.title}
                            </Text>
                            <Text className="text-[12px] text-gray-400 mt-0.5">
                                {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <Text className={`text-[14px] leading-5 ${item.is_read ? 'text-gray-500' : 'text-gray-800'}`}>
                            {item.body}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={renderEmpty}
        />
    );
}
