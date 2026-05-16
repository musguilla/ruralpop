import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { MessageCircle, Search, User as UserIcon } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getDefaultTenantFilterString } from '../../src/config/tenants';

interface Conversation {
    other_user_id: string;
    other_user_name: string;
    other_user_avatar?: string;
    listing_id: string;
    listing_title: string;
    listing_image?: string;
    listing_price?: number;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

export default function MessagesScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [fetching, setFetching] = useState(true);

    // Refetch on focus to clear badges
    useFocusEffect(
        useCallback(() => {
            if (session && user) {
                fetchConversations();
            }
        }, [session, user])
    );

    async function fetchConversations() {
        if (!user) return;
        setFetching(true);
        try {
            // Fetch all messages involving the user
            const { data: messagesData, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    created_at,
                    is_read,
                    sender_id,
                    receiver_id,
                    listing_id,
                    listings!inner (title, price, image_urls),
                    sender:users!messages_sender_id_fkey(id, name, commercial_name, avatar_url),
                    receiver:users!messages_receiver_id_fkey(id, name, commercial_name, avatar_url)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .or(getDefaultTenantFilterString(), { referencedTable: 'listings' })
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group messages by (listing_id + other_user_id)
            const groups = new Map<string, Conversation>();

            (messagesData || []).forEach((msg) => {
                const isSender = msg.sender_id === user.id;
                const otherUserId = isSender ? msg.receiver_id : msg.sender_id;
                const otherUserRaw = isSender ? msg.receiver : msg.sender;
                const otherUser = Array.isArray(otherUserRaw) ? otherUserRaw[0] : otherUserRaw;

                const key = `${msg.listing_id}_${otherUserId}`;

                if (!groups.has(key)) {
                    groups.set(key, {
                        other_user_id: otherUserId,
                        other_user_name: (otherUser as any)?.commercial_name || (otherUser as any)?.name || 'Usuario',
                        other_user_avatar: (otherUser as any)?.avatar_url,
                        listing_id: msg.listing_id,
                        listing_title: Array.isArray(msg.listings) ? (msg.listings[0] as any)?.title : (msg.listings as any)?.title || 'Anuncio Ruralpop',
                        listing_image: Array.isArray(msg.listings) ? (msg.listings[0] as any)?.image_urls?.[0] : (msg.listings as any)?.image_urls?.[0],
                        listing_price: Array.isArray(msg.listings) ? (msg.listings[0] as any)?.price : (msg.listings as any)?.price,
                        last_message: msg.content,
                        last_message_time: msg.created_at,
                        unread_count: (!isSender && !msg.is_read) ? 1 : 0
                    });
                } else if (!isSender && !msg.is_read) {
                    const existing = groups.get(key)!;
                    existing.unread_count += 1;
                }
            });

            setConversations(Array.from(groups.values()));
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setFetching(false);
        }
    }

    if (isLoading) return null;

    if (!session) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-6">
                    <MessageCircle className="text-primary" size={32} />
                </View>
                <Text className="text-xl font-bold text-center text-text mb-2">Inicia sesión para leer tus mensajes</Text>
                <Text className="text-center text-text-muted mb-8">
                    Contacta con vendedores y gestiona tus compras de forma segura y directa.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full mb-2 w-full items-center"
                >
                    <Text className="text-white font-bold text-base">Iniciar sesión</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderEmpty = () => (
        <View className="flex-1 justify-center items-center p-8 mt-10">
            <MessageCircle className="text-gray-300 mb-4" size={56} />
            <Text className="text-xl font-bold text-text mb-2">Sin mensajes</Text>
            <Text className="text-gray-500 text-center text-base">
                Aún no tienes conversaciones. Busca anuncios y contacta con el vendedor para empezar.
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View 
                className="px-4 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <Text className="text-2xl font-extrabold text-text">Mensajes</Text>
            </View>

            {fetching ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => `${item.listing_id}_${item.other_user_id}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/messages/chat',
                                params: { 
                                    listingId: item.listing_id, 
                                    otherUserId: item.other_user_id,
                                    otherUserName: item.other_user_name,
                                    otherUserAvatar: item.other_user_avatar || '',
                                    listingImage: item.listing_image || '',
                                    listingPrice: item.listing_price ? item.listing_price.toString() : '',
                                    listingTitle: item.listing_title
                                }
                            })}
                            className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center active:bg-gray-50"
                        >
                            <View className="w-[60px] h-[60px] rounded-2xl overflow-hidden mr-4 border border-gray-100 bg-gray-100">
                                {item.listing_image ? (
                                    <Image source={{ uri: item.listing_image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center">
                                        <MessageCircle color="#9ca3af" size={24} />
                                    </View>
                                )}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-[13px] font-medium text-gray-400 truncate max-w-[70%]" numberOfLines={1}>
                                        {item.other_user_name}
                                    </Text>
                                    <Text className="text-[12px] text-gray-400">
                                        {new Date(item.last_message_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <Text className="font-bold text-[16px] text-gray-900 mb-1 truncate" numberOfLines={1}>
                                    {item.listing_title}
                                </Text>
                                <View className="flex-row justify-between items-center">
                                    <Text className={`flex-1 mr-4 truncate ${item.unread_count > 0 ? 'text-primary font-bold' : 'text-gray-500'}`} numberOfLines={1}>
                                        {item.last_message}
                                    </Text>
                                    {item.unread_count > 0 && (
                                        <View className="bg-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                                            <Text className="text-white text-[10px] font-bold">{item.unread_count}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </SafeAreaView>
    );
}
