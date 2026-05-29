import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../../src/lib/image-optimization';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { ChevronLeft, Send, ImageIcon } from 'lucide-react-native';
import { getDefaultTenantFilterString, getRuralpopDatabaseId } from '../../src/config/tenants';
import { formatPrice } from '../../src/lib/formatters';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
}

export default function ChatScreen() {
    const { listingId, otherUserId, otherUserName: paramName, otherUserAvatar: paramAvatar, listingImage, listingPrice, listingTitle } = useLocalSearchParams<{ listingId: string, otherUserId: string, otherUserName?: string, otherUserAvatar?: string, listingImage?: string, listingPrice?: string, listingTitle?: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [listingData, setListingData] = useState<{ title: string, price: number, image_url: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUserName, setOtherUserName] = useState<string>(paramName || 'Usuario');
    const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(paramAvatar || null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!user || !listingId || !otherUserId) {
            router.back();
            return;
        }

        fetchOtherUser();
        fetchListingData();
        fetchMessages();
        markAsRead();

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`public:messages:${listingId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `listing_id=eq.${listingId}`,
            }, (payload) => {
                const incomingMessage = payload.new as Message;
                // Only act on messages belonging to this current conversation (me and the other user)
                if (
                    (incomingMessage.sender_id === user.id && incomingMessage.receiver_id === otherUserId) ||
                    (incomingMessage.sender_id === otherUserId && incomingMessage.receiver_id === user.id)
                ) {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === incomingMessage.id)) return prev;

                        const isMine = incomingMessage.sender_id === user.id;
                        if (isMine) {
                            // Replace optimistic temp message
                            const withoutTemp = prev.filter(m => !(m.id.startsWith("temp-") && m.content === incomingMessage.content));
                            return [incomingMessage, ...withoutTemp];
                        }
                        return [incomingMessage, ...prev];
                    });
                    if (incomingMessage.receiver_id === user.id) markAsRead();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, listingId, otherUserId]);

    async function fetchOtherUser() {
        if (!otherUserId) return;
        const { data } = await supabase.from('users').select('name, full_name, commercial_name, avatar_url').eq('id', otherUserId).single();
        if (data) {
            if (!paramName) setOtherUserName(data.commercial_name || data.name || data.full_name || 'Usuario');
            if (!paramAvatar) setOtherUserAvatar(data.avatar_url);
        }
    }

    async function fetchListingData() {
        if (!listingId) return;
        const { data } = await supabase.from('listings').select('title, price, image_urls').eq('id', listingId).or(getDefaultTenantFilterString()).single();
        if (data) {
            setListingData({
                title: data.title,
                price: data.price,
                image_url: data.image_urls?.[0] || ''
            });
        }
    }

    async function markAsRead() {
        if (!user || !listingId || !otherUserId) return;
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('listing_id', listingId)
            .eq('receiver_id', user.id)
            .eq('sender_id', otherUserId)
            .eq('is_read', false);

        if (error) {
            console.error("markAsRead error:", error);
        }
    }

    async function fetchMessages() {
        if (!user || !listingId || !otherUserId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', listingId)
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching chat', error);
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage() {
        if (!newMessage.trim() || !user || !listingId || !otherUserId) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage('');

        // Optimistic UI Update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: otherUserId,
            content: content,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [optimisticMessage, ...prev]);

        try {
            // Insert in DB
            const { error } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: otherUserId,
                listing_id: listingId,
                content: content,
                tenant_id: getRuralpopDatabaseId() || undefined,
            });

            if (error) throw error;

            // Check receiver's push token using the secure RPC
            const { data: receiverToken } = await supabase
                .rpc('get_push_token', { target_user_id: otherUserId });

            if (receiverToken) {
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: receiverToken,
                        sound: 'default',
                        title: `Nuevo mensaje de ${user?.user_metadata?.full_name || 'Alguien'}`,
                        body: content,
                        data: { listingId, otherUserId: user.id },
                    }),
                });
            }

        } catch (error) {
            console.error('Send Error', error);
        } finally {
            setSending(false);
        }
    }

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isMe = item.sender_id === user?.id;

        const currentDateStr = new Date(item.created_at).toDateString();
        const prevDateStr = index < messages.length - 1 ? new Date(messages[index + 1].created_at).toDateString() : null;
        const showDateSeparator = currentDateStr !== prevDateStr;

        let dateSeparator = null;
        if (showDateSeparator) {
            const dateObj = new Date(item.created_at);
            let formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            dateSeparator = (
                <View className="items-center my-4">
                    <View className="bg-gray-300 px-4 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">{formattedDate}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View className="w-full">
                {dateSeparator}
                <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <View className={`rounded-2xl px-4 py-3 ${isMe ? 'bg-gray-200' : 'bg-white border border-gray-200'}`}>
                        <Text className="text-[15px] text-gray-800">
                            {item.content}
                        </Text>
                    </View>
                    <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View 
                className="px-4 pb-3 bg-white border-b border-gray-100 flex-row items-center"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 12) : 12 }}
            >
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ChevronLeft color="#374151" size={28} />
                </TouchableOpacity>

                {/* Product Image & Details (Clickable) */}
                <TouchableOpacity 
                    className="flex-row flex-1 items-center mr-2"
                    onPress={() => router.push({ pathname: '/anuncio/[id]', params: { id: listingId } })}
                >
                    <View className="w-12 h-12 rounded-xl bg-gray-100 mr-3 overflow-hidden border border-gray-100 items-center justify-center">
                        {listingData?.image_url || listingImage ? (
                            <Image source={{ uri: listingData?.image_url || listingImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                            <ImageIcon color="#9ca3af" size={20} />
                        )}
                    </View>

                    <View className="flex-1 justify-center">
                        <Text className="text-[17px] font-bold text-gray-900 leading-tight">
                            {listingData?.price !== undefined ? formatPrice(listingData.price) : listingPrice ? formatPrice(listingPrice) : 'Consultar'}
                        </Text>
                        <Text className="text-[14px] text-gray-500 truncate" numberOfLines={1}>
                            {listingData?.title || listingTitle || 'Anuncio'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* User Avatar */}
                <View className="w-8 h-8 rounded-full bg-primary-muted items-center justify-center mr-2 overflow-hidden border border-gray-100">
                    {otherUserAvatar ? (
                        <Image source={{ uri: getOptimizedImageUrl(otherUserAvatar, { width: 100 }) || undefined }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                        <Text className="text-sm font-bold text-primary uppercase">{otherUserName.charAt(0)}</Text>
                    )}
                </View>

            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Ajustado a 0 para eliminar el espacio en blanco en iPhone
            >
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        inverted={true}
                        contentContainerStyle={{ padding: 16 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <View 
                    className="bg-white border-t border-gray-200 px-4 pt-3 flex-row items-center"
                    style={{ paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : 12 }}
                >
                    <TextInput
                        className="flex-1 bg-surface-muted border border-gray-200 rounded-full px-4 h-12 text-base text-gray-800 mr-2"
                        style={{ paddingVertical: 0, color: '#1f2937' }}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor="#9ca3af"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline={false}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={`w-12 h-12 rounded-full items-center justify-center ${newMessage.trim() && !sending ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Send color="white" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
