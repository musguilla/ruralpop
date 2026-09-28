import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUnread } from '../../src/contexts/UnreadContext';
import { MessageCircle, Trash2 } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { getDefaultTenantFilterString } from '../../src/config/tenants';
import NotificationsList from '../../src/components/NotificationsList';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'mensajes' | 'notificaciones';

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

interface PendingConversationDeletion {
    item: Conversation;
    index: number;
}

export default function MessagesScreen() {
    const { session, user, isLoading } = useAuth();
    const { unreadMessages, unreadNotifications, refreshUnread } = useUnread();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('mensajes');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [fetching, setFetching] = useState(true);

    // Estado para el snackbar con Deshacer (10 segundos)
    const [pendingDeletion, setPendingDeletion] = useState<PendingConversationDeletion | null>(null);
    const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingDeletionRef = useRef<PendingConversationDeletion | null>(null);

    // Mantener la referencia sincronizada
    useEffect(() => {
        pendingDeletionRef.current = pendingDeletion;
    }, [pendingDeletion]);

    // Limpieza al desmontar: consolidar borrado pendiente si existiese
    useEffect(() => {
        return () => {
            if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
            }
            if (pendingDeletionRef.current && user?.id) {
                finalizeDeleteConversation(pendingDeletionRef.current.item, user.id);
            }
        };
    }, [user?.id]);

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
            // Read hidden/deleted conversations timestamps from local storage
            let hiddenMap: Record<string, number> = {};
            try {
                const stored = await AsyncStorage.getItem(`@hidden_conversations_${user.id}`);
                if (stored) {
                    hiddenMap = JSON.parse(stored);
                }
            } catch (storageErr) {
                console.warn('Error reading hidden conversations from storage:', storageErr);
            }

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

                // Si la conversación fue borrada por el usuario y el mensaje es anterior a ese borrado, omitir
                const deletedTimestamp = hiddenMap[key];
                if (deletedTimestamp && new Date(msg.created_at).getTime() <= deletedTimestamp) {
                    return;
                }

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

    // Función que consolida el borrado en base de datos y almacenamiento tras vencer los 10 segundos
    const finalizeDeleteConversation = async (item: Conversation, userId: string) => {
        try {
            const key = `${item.listing_id}_${item.other_user_id}`;
            const storageKey = `@hidden_conversations_${userId}`;
            const stored = await AsyncStorage.getItem(storageKey);
            const hiddenMap: Record<string, number> = stored ? JSON.parse(stored) : {};
            hiddenMap[key] = Date.now();
            await AsyncStorage.setItem(storageKey, JSON.stringify(hiddenMap));

            await supabase
                .from('messages')
                .delete()
                .eq('listing_id', item.listing_id)
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${item.other_user_id}),and(sender_id.eq.${item.other_user_id},receiver_id.eq.${userId})`);

            refreshUnread();
        } catch (err) {
            console.error('Error finalising conversation delete:', err);
        }
    };

    // Borrado directo sin alerta con opción Deshacer durante 10 segundos
    const handleDeleteConversation = (item: Conversation) => {
        if (!user) return;

        // Si ya había una eliminación pendiente anterior, consolidarla antes de iniciar la nueva
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            if (pendingDeletionRef.current) {
                finalizeDeleteConversation(pendingDeletionRef.current.item, user.id);
            }
        }

        const key = `${item.listing_id}_${item.other_user_id}`;
        const currentIndex = conversations.findIndex(c => `${c.listing_id}_${c.other_user_id}` === key);
        const savedIndex = currentIndex >= 0 ? currentIndex : 0;

        // 1. Quitar visualmente de forma inmediata
        setConversations(prev => prev.filter(c => `${c.listing_id}_${c.other_user_id}` !== key));
        setPendingDeletion({ item, index: savedIndex });

        // 2. Iniciar temporizador de 10 segundos para consolidar
        undoTimerRef.current = setTimeout(() => {
            finalizeDeleteConversation(item, user.id);
            setPendingDeletion(null);
            undoTimerRef.current = null;
        }, 10000);
    };

    // Acción para deshacer y restaurar la conversación a su posición original
    const handleUndoDelete = () => {
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            undoTimerRef.current = null;
        }

        if (pendingDeletion) {
            const { item, index } = pendingDeletion;
            setConversations(prev => {
                const next = [...prev];
                next.splice(index, 0, item);
                return next;
            });
            setPendingDeletion(null);
        }
    };

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

    const renderRightActions = (
        _progress: Animated.AnimatedInterpolation<number | string>,
        _dragX: Animated.AnimatedInterpolation<number | string>,
        swipeable: Swipeable,
        item: Conversation
    ) => {
        return (
            <RectButton
                onPress={() => {
                    swipeable.close();
                    handleDeleteConversation(item);
                }}
                style={styles.deleteAction}
            >
                <View style={styles.deleteActionContent}>
                    <Trash2 color="#ffffff" size={24} />
                    <Text style={styles.deleteActionText}>Borrar</Text>
                </View>
            </RectButton>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View 
                className="px-4 pb-2 bg-white border-b border-gray-100"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <View className="flex-row bg-gray-100 rounded-full self-start p-1">
                    <TouchableOpacity 
                        onPress={() => setActiveTab('mensajes')}
                        className={`px-6 py-2 rounded-full flex-row items-center ${activeTab === 'mensajes' ? 'bg-[#1a2b3c]' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'mensajes' ? 'text-white' : 'text-gray-600'}`}>
                            Mensajes
                        </Text>
                        {unreadMessages > 0 && (
                            <View className={`rounded-full h-5 min-w-[20px] px-1.5 ml-2 items-center justify-center ${activeTab === 'mensajes' ? 'bg-white' : 'bg-primary'}`}>
                                <Text className={`text-[11px] font-bold ${activeTab === 'mensajes' ? 'text-primary' : 'text-white'}`}>{unreadMessages}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setActiveTab('notificaciones')}
                        className={`px-6 py-2 rounded-full flex-row items-center ${activeTab === 'notificaciones' ? 'bg-[#1a2b3c]' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'notificaciones' ? 'text-white' : 'text-gray-600'}`}>
                            Notificaciones
                        </Text>
                        {unreadNotifications > 0 && (
                            <View className={`rounded-full h-5 min-w-[20px] px-1.5 ml-2 items-center justify-center ${activeTab === 'notificaciones' ? 'bg-white' : 'bg-primary'}`}>
                                <Text className={`text-[11px] font-bold ${activeTab === 'notificaciones' ? 'text-primary' : 'text-white'}`}>{unreadNotifications}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'notificaciones' ? (
                <NotificationsList />
            ) : fetching ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => `${item.listing_id}_${item.other_user_id}`}
                    renderItem={({ item }) => (
                        <Swipeable
                            friction={2}
                            rightThreshold={40}
                            overshootRight={false}
                            renderRightActions={(progress, dragX, swipeable) =>
                                renderRightActions(progress, dragX, swipeable, item)
                            }
                        >
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
                        </Swipeable>
                    )}
                    ListEmptyComponent={renderEmpty}
                />
            )}

            {/* Snackbar flotante estilo Wallapop: Conversación eliminada + Deshacer (10 seg) */}
            {pendingDeletion && (
                <View style={styles.snackbar}>
                    <Text style={styles.snackbarText}>Conversación eliminada</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleUndoDelete}
                        style={styles.undoButton}
                    >
                        <Text style={styles.undoButtonText}>Deshacer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    deleteAction: {
        backgroundColor: '#dc2626',
        width: 88,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteActionContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteActionText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 5,
    },
    snackbar: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#263238',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 999,
    },
    snackbarText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    undoButton: {
        backgroundColor: '#2dd4bf', // Verde menta / ruralpop
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 16,
        marginLeft: 12,
    },
    undoButtonText: {
        color: '#064e3b', // Texto oscuro de alto contraste
        fontWeight: '800',
        fontSize: 14,
    },
});

/**
 * Memory / Decisiones Técnicas:
 * - Eliminación directa sin confirmación modal invasiva (patrón Wallapop).
 * - Notificación flotante snackbar inferior oscura con temporizador de 10 segundos.
 * - Botón "Deshacer" en verde ruralpop que restaura la conversación en su posición exacta al instante.
 * - Si transcurren los 10 segundos sin deshacer, se consolida la eliminación definitiva en Supabase y almacenamiento local.
 * - Compatibilidad Android / iOS: se utiliza RectButton de react-native-gesture-handler en renderRightActions
 *   para garantizar que el evento onPress de "Borrar" se capture de manera nativa sin ser interceptado o cancelado
 *   por el PanGestureHandler en Android.
 */
