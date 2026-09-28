import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useUnread } from '../contexts/UnreadContext';
import { supabase } from '../lib/supabase';
import { Bell, Trash2, Tag, PiggyBank, Flame, Rocket } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 1. Interfaces
// ============================================================================

export interface NotificationData {
    url?: string;
    listing_id?: string;
    listing_title?: string;
    image_url?: string;
    listing_image?: string;
    discount_percent?: number;
    favorites_count?: number;
    old_price?: number;
    new_price?: number;
    [key: string]: unknown;
}

export interface NotificationItem {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
    data?: NotificationData | null;
}

interface PendingNotificationDeletion {
    item: NotificationItem;
    index: number;
}

export type NotificationBadgeType = 'piggy' | 'flame' | 'rocket' | null;

interface FormattedNotification {
    title: string;
    body: string;
    imageUrl: string | null;
    relativeTime: string;
    badgeType?: NotificationBadgeType;
}

// ============================================================================
// Helpers de Parseo & Formateo Estilo Wallapop
// ============================================================================

/**
 * Extrae el ID del anuncio de data.listing_id o del path en data.url (/anuncio/:id)
 */
const extractListingId = (data?: NotificationData | null): string | null => {
    if (!data) return null;
    if (typeof data.listing_id === 'string' && data.listing_id) return data.listing_id;
    if (typeof data.url === 'string' && data.url) {
        const match = data.url.match(/\/anuncio\/([a-zA-Z0-9-]+)/);
        if (match) return match[1];
    }
    return null;
};

/**
 * Formatea fechas a tiempo relativo estilo Wallapop ('hace 3 días', 'hace 2 h', 'ayer', etc.)
 */
const formatRelativeTime = (dateString: string): string => {
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';

        const now = Date.now();
        const diffMs = now - d.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSec < 60) return 'Ahora';
        if (diffMin < 60) return `hace ${diffMin} min`;
        if (diffHours < 24) return `hace ${diffHours} h`;
        if (diffDays === 1) return 'ayer';
        if (diffDays < 7) return `hace ${diffDays} días`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `hace ${weeks} sem`;
        }
        const months = Math.floor(diffDays / 30);
        return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } catch {
        return '';
    }
};

/**
 * Transforma el título y el cuerpo de la notificación al formato exacto de Wallapop:
 * - Favoritos: "⭐ Tienes un nuevo favorito" y "¡"Nombre del producto" está gustando!"
 * - Nuevos productos: "✨ Nuevo producto..."
 * - Mensajes: "💬 Nuevo mensaje..."
 */
const formatNotificationDisplay = (item: NotificationItem): FormattedNotification => {
    let title = item.title;
    let body = item.body;
    const imageUrl = (item.data?.image_url as string) || (item.data?.listing_image as string) || null;
    const relativeTime = formatRelativeTime(item.created_at);

    // 1. Bajada de precio (Patrón Wallapop: Hucha verde + emoji 📉👀)
    if (
        item.type === 'price_drop' ||
        item.title.toLowerCase().includes('bajada de precio') ||
        item.body.toLowerCase().includes('más barato')
    ) {
        title = 'Bajada de precio 📉👀';

        const discount = item.data?.discount_percent;
        const matchQuote = item.body.match(/["“«]([^"”»]+)["”»]/);
        const listingTitle = (item.data?.listing_title as string) || (matchQuote ? matchQuote[1] : null);
        const percentMatch = item.body.match(/(\d+)%/);
        const percentStr = discount !== undefined && discount !== null ? `${discount}` : (percentMatch ? percentMatch[1] : null);

        if (listingTitle && percentStr) {
            body = `"${listingTitle}" es un ${percentStr}% más barato... ¡Que no se te escape!`;
        } else if (listingTitle) {
            body = `"${listingTitle}" ha bajado de precio... ¡Que no se te escape!`;
        }

        return {
            title,
            body,
            imageUrl,
            relativeTime,
            badgeType: 'piggy',
        };
    }

    // 2. Destacado a punto de caducar (1 día antes: solo si > 3 me gusta)
    if (
        item.type === 'featured_expiring_soon' ||
        item.title.toLowerCase().includes('a punto de venderlo')
    ) {
        title = '🔥 ¡Estás a punto de venderlo!';

        const likes = item.data?.favorites_count;
        const matchQuote = item.body.match(/["“«]([^"”»]+)["”»]/);
        const listingTitle = (item.data?.listing_title as string) || (matchQuote ? matchQuote[1] : null);

        if (listingTitle && likes) {
            body = `"${listingTitle}" ya tiene ${likes} me gusta ❤️ y tu destacado termina mañana. ¡Estás muy cerca de cerrarlo!`;
        }

        return {
            title,
            body,
            imageUrl,
            relativeTime,
            badgeType: 'flame',
        };
    }

    // 3. Destacado caducado (Aviso el mismo día para renovar visibilidad)
    if (
        item.type === 'featured_expired' ||
        item.title.toLowerCase().includes('no pierdas tu visibilidad') ||
        item.body.toLowerCase().includes('renuévalo ahora')
    ) {
        title = '🚀 ¡No pierdas tu visibilidad!';

        const matchQuote = item.body.match(/["“«]([^"”»]+)["”»]/);
        const listingTitle = (item.data?.listing_title as string) || (matchQuote ? matchQuote[1] : null);

        if (listingTitle) {
            body = `El destacado de "${listingTitle}" ha terminado hoy. Renuévalo ahora para venderlo cuanto antes.`;
        }

        return {
            title,
            body,
            imageUrl,
            relativeTime,
            badgeType: 'rocket',
        };
    }

    // 2. Favoritos (Patrón Wallapop)
    if (
        item.type === 'favorite' ||
        item.title.toLowerCase().includes('favorito') ||
        item.title.toLowerCase().includes('gusta tu artículo')
    ) {
        title = '⭐ Tienes un nuevo favorito';

        // Extraer el nombre del producto si viene entre comillas
        const matchQuote = item.body.match(/["“«]([^"”»]+)["”»]/);
        const listingTitle = (item.data?.listing_title as string) || (matchQuote ? matchQuote[1] : null);

        if (listingTitle) {
            body = `¡"${listingTitle}" está gustando!`;
        } else if (!item.body.startsWith('¡"') && !item.body.includes('está gustando')) {
            body = '¡Uno de tus artículos está gustando!';
        }
    }
    // 2. Nuevos anuncios de vendedores seguidos
    else if (
        item.type === 'new_listing' ||
        item.title.toLowerCase().includes('nuevo anuncio') ||
        item.title.toLowerCase().includes('nuevos anuncios')
    ) {
        if (!title.includes('✨') && !title.includes('📦')) {
            title = `✨ ${title}`;
        }
    }
    // 3. Mensajes de chat
    else if (item.type === 'message' || item.title.toLowerCase().includes('mensaje')) {
        if (!title.includes('💬')) {
            title = `💬 ${title}`;
        }
    }
    // 4. Ventas
    else if (
        item.type === 'sale' ||
        item.title.toLowerCase().includes('venta') ||
        item.title.toLowerCase().includes('vendido')
    ) {
        if (!title.includes('🎉')) {
            title = `🎉 ${title}`;
        }
    }
    // Fallback general: si no tiene emoji, anteponer campana
    else if (!/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(title)) {
        title = `🔔 ${title}`;
    }

    return {
        title,
        body,
        imageUrl,
        relativeTime,
    };
};

// ============================================================================
// 2. Component Logic & Implementation
// ============================================================================

const getHiddenStorageKey = (userId: string) => `@hidden_notifications_${userId}`;

export default function NotificationsList() {
    const { user, session } = useAuth();
    const { refreshUnread, decrementUnreadNotification, incrementUnreadNotification } = useUnread();
    const router = useRouter();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Estado y refs para la funcionalidad de borrado con snackbar de 5s "Deshacer"
    const [pendingDeletion, setPendingDeletion] = useState<PendingNotificationDeletion | null>(null);
    const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingDeletionRef = useRef<PendingNotificationDeletion | null>(null);

    // Sincronizar referencia mutable para limpiezas asíncronas
    useEffect(() => {
        pendingDeletionRef.current = pendingDeletion;
    }, [pendingDeletion]);

    /**
     * Elimina definitivamente el registro en Supabase mediante endpoint backend
     * y asegura la persistencia en AsyncStorage para que nunca reaparezca.
     */
    const finalizeDeleteNotification = useCallback(async (item: NotificationItem, userId: string): Promise<void> => {
        try {
            // 1. Asegurar persistencia local en AsyncStorage
            const storageKey = getHiddenStorageKey(userId);
            const stored = await AsyncStorage.getItem(storageKey);
            const hiddenMap: Record<string, number> = stored ? JSON.parse(stored) : {};
            hiddenMap[item.id] = Date.now();
            await AsyncStorage.setItem(storageKey, JSON.stringify(hiddenMap));

            // 2. Invocar endpoint backend Next.js que usa supabaseAdmin (bypasea RLS en PostgreSQL)
            const ruralpopDomain = process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
            try {
                await fetch(`${ruralpopDomain}/api/notifications/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                    },
                    body: JSON.stringify({
                        notificationId: item.id,
                        userId,
                    }),
                });
            } catch (apiErr) {
                console.warn('Backend notification delete API call:', apiErr);
            }

            // 3. Fallback directo a Supabase client
            await supabase
                .from('notifications')
                .delete()
                .eq('id', item.id)
                .eq('user_id', userId);

            // 4. Refrescar estado global de no leídos
            await refreshUnread();
        } catch (err: unknown) {
            console.error('Error finalising notification delete:', err);
        }
    }, [session?.access_token, refreshUnread]);

    // Limpieza al desmontar: si el usuario cambia de pantalla antes de los 5s, consolidar el borrado inmediatamente
    useEffect(() => {
        return () => {
            if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
            }
            if (pendingDeletionRef.current && user?.id) {
                finalizeDeleteNotification(pendingDeletionRef.current.item, user.id);
            }
        };
    }, [user?.id, finalizeDeleteNotification]);

    /**
     * Consulta las notificaciones del usuario autenticado en Supabase,
     * filtra cualquier notificación eliminada guardada en AsyncStorage,
     * y resuelve en lote las fotos de producto de la tabla listings si faltasen.
     */
    const fetchNotifications = useCallback(async (showLoading = true): Promise<void> => {
        if (!user) {
            setFetching(false);
            return;
        }

        if (showLoading) {
            setFetching(true);
        }

        try {
            // 1. Obtener mapa de notificaciones ocultas / borradas en AsyncStorage
            let hiddenMap: Record<string, number> = {};
            try {
                const storageKey = getHiddenStorageKey(user.id);
                const stored = await AsyncStorage.getItem(storageKey);
                if (stored) {
                    hiddenMap = JSON.parse(stored);
                }
            } catch (storageErr) {
                console.warn('Error reading hidden notifications from storage:', storageErr);
            }

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const rawNotifications = (data as NotificationItem[]) || [];

            // 2. Filtrar inmediatamente las notificaciones borradas para que no reaparezcan al cambiar de vista
            const visibleNotifications = rawNotifications.filter(notif => !hiddenMap[notif.id]);

            // Detectar IDs de anuncios sin foto guardada en el json de la notificación
            const missingListingIds = new Set<string>();
            visibleNotifications.forEach(notif => {
                const img = notif.data?.image_url || notif.data?.listing_image;
                if (!img) {
                    const lId = extractListingId(notif.data);
                    if (lId) missingListingIds.add(lId);
                }
            });

            // Consulta en lote de imágenes en listings
            let listingImagesMap: Record<string, string> = {};
            if (missingListingIds.size > 0) {
                try {
                    const { data: listingsData } = await supabase
                        .from('listings')
                        .select('id, image_urls')
                        .in('id', Array.from(missingListingIds));

                    if (listingsData) {
                        listingsData.forEach((l: { id: string; image_urls?: string[] | null }) => {
                            if (l.image_urls && l.image_urls.length > 0) {
                                listingImagesMap[l.id] = l.image_urls[0];
                            }
                        });
                    }
                } catch (listingErr) {
                    console.warn('Error resolviendo imágenes de anuncios:', listingErr);
                }
            }

            // Enriquecer cada notificación con su foto de producto correspondiente
            const enriched = visibleNotifications.map(notif => {
                const existingImg = notif.data?.image_url || notif.data?.listing_image;
                if (!existingImg) {
                    const lId = extractListingId(notif.data);
                    if (lId && listingImagesMap[lId]) {
                        return {
                            ...notif,
                            data: {
                                ...notif.data,
                                image_url: listingImagesMap[lId],
                            },
                        };
                    }
                }
                return notif;
            });

            setNotifications(enriched);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            if (showLoading) {
                setFetching(false);
            }
        }
    }, [user]);

    // Disparo inmediato al montar el componente (garantiza render tras cambiar de tab)
    useEffect(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    // Refresco en segundo plano cuando la pantalla recupera el foco de navegación
    useFocusEffect(
        useCallback(() => {
            fetchNotifications(false);
        }, [fetchNotifications])
    );

    // Pull-to-refresh
    const onRefresh = useCallback(async (): Promise<void> => {
        if (!user) return;
        setRefreshing(true);
        try {
            await fetchNotifications(false);
            await refreshUnread();
        } finally {
            setRefreshing(false);
        }
    }, [user, fetchNotifications, refreshUnread]);

    /**
     * Marca la notificación como leída y navega al destino si existe en data.url
     */
    const markAsReadAndNavigate = async (notification: NotificationItem): Promise<void> => {
        if (!notification.is_read) {
            try {
                // Actualización optimista local
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );

                const { error } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', notification.id);

                if (error) {
                    console.error('Error marking notification as read in database:', error);
                }

                await refreshUnread();
            } catch (e) {
                console.error('Failed to mark notification as read:', e);
            }
        }

        // Navegación segura si la notificación contiene una URL válida
        if (notification.data?.url && typeof notification.data.url === 'string') {
            try {
                router.push(notification.data.url as unknown as Href);
            } catch (err) {
                console.warn('Navigation error for notification url:', notification.data.url, err);
            }
        }
    };

    /**
     * Inicia borrado con snackbar temporal de 5s (UX no intrusiva)
     */
    const handleDeleteNotification = (item: NotificationItem): void => {
        if (!user) return;

        // Si ya había una eliminación pendiente previa, consolidarla antes de abrir una nueva
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            if (pendingDeletionRef.current) {
                finalizeDeleteNotification(pendingDeletionRef.current.item, user.id);
            }
        }

        const currentIndex = notifications.findIndex(n => n.id === item.id);
        const savedIndex = currentIndex >= 0 ? currentIndex : 0;

        // 1. Quitar visualmente al instante de la lista
        setNotifications(prev => prev.filter(n => n.id !== item.id));
        setPendingDeletion({ item, index: savedIndex });

        // 2. Guardar preventivamente en AsyncStorage para que al cambiar de vista no reaparezca
        try {
            const storageKey = getHiddenStorageKey(user.id);
            AsyncStorage.getItem(storageKey).then(stored => {
                const hiddenMap: Record<string, number> = stored ? JSON.parse(stored) : {};
                hiddenMap[item.id] = Date.now();
                AsyncStorage.setItem(storageKey, JSON.stringify(hiddenMap));
            });
        } catch (e) {
            console.warn('AsyncStorage pre-delete error:', e);
        }

        // 3. Decrementar inmediatamente el badge si estaba no leída y marcar en BD para evitar desincronización
        if (!item.is_read) {
            decrementUnreadNotification();
            supabase.from('notifications').update({ is_read: true }).eq('id', item.id).then();
        }

        // 4. Temporizador de 5 segundos para consolidar definitivamente en BD
        undoTimerRef.current = setTimeout(() => {
            finalizeDeleteNotification(item, user.id);
            setPendingDeletion(null);
            undoTimerRef.current = null;
        }, 5000);
    };

    /**
     * Restaura la notificación cancelando el temporizador de borrado dentro de los 5s
     */
    const handleUndoDelete = (): void => {
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            undoTimerRef.current = null;
        }

        if (pendingDeletion && user) {
            const { item, index } = pendingDeletion;

            // 1. Quitar de AsyncStorage para que vuelva a estar visible si recarga
            try {
                const storageKey = getHiddenStorageKey(user.id);
                AsyncStorage.getItem(storageKey).then(stored => {
                    if (stored) {
                        const hiddenMap: Record<string, number> = JSON.parse(stored);
                        delete hiddenMap[item.id];
                        AsyncStorage.setItem(storageKey, JSON.stringify(hiddenMap));
                    }
                });
            } catch (e) {
                console.warn('AsyncStorage undo delete error:', e);
            }

            // 2. Si estaba sin leer originalmente, restaurar badge e is_read en base de datos
            if (!item.is_read) {
                incrementUnreadNotification();
                supabase.from('notifications').update({ is_read: false }).eq('id', item.id).then();
            }

            // 3. Restaurar en lista local
            setNotifications(prev => {
                const next = [...prev];
                next.splice(index, 0, item);
                return next;
            });
            setPendingDeletion(null);
        }
    };

    /**
     * Render del botón de acción lateral para swipeable con RectButton para Android
     */
    const renderRightActions = (
        _progress: Animated.AnimatedInterpolation<number | string>,
        _dragX: Animated.AnimatedInterpolation<number | string>,
        swipeable: Swipeable,
        item: NotificationItem
    ): React.ReactNode => {
        return (
            <RectButton
                onPress={() => {
                    swipeable.close();
                    handleDeleteNotification(item);
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

    /**
     * Estado vacío cuando no hay notificaciones
     */
    const renderEmpty = (): React.ReactElement => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Bell color="#9ca3af" size={44} />
            </View>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyText}>
                Aquí aparecerán tus notificaciones sobre ventas, compras y avisos de anuncios.
            </Text>
        </View>
    );

    // ============================================================================
    // 3. Render
    // ============================================================================

    if (fetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : undefined}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#059669']}
                        tintColor="#059669"
                    />
                }
                renderItem={({ item }) => {
                    const { title, body, imageUrl, relativeTime, badgeType } = formatNotificationDisplay(item);

                    return (
                        <Swipeable
                            friction={2}
                            rightThreshold={40}
                            overshootRight={false}
                            renderRightActions={(progress, dragX, swipeable) =>
                                renderRightActions(progress, dragX, swipeable, item)
                            }
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => markAsReadAndNavigate(item)}
                                style={[
                                    styles.itemContainer,
                                    item.is_read ? styles.itemRead : styles.itemUnread,
                                ]}
                            >
                                {/* Foto cuadrada del producto con esquinas redondeadas estilo Wallapop */}
                                <View style={styles.imageWrapper}>
                                    {imageUrl ? (
                                        <Image
                                            source={{ uri: imageUrl }}
                                            style={styles.productImage}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    ) : (
                                        <View style={styles.imageFallback}>
                                            <Tag color="#9ca3af" size={24} />
                                        </View>
                                    )}
                                    {/* Badges circulares contextuales estilo Wallapop en esquina superior izquierda */}
                                    {badgeType === 'piggy' && (
                                        <View style={styles.badgeContainer}>
                                            <PiggyBank color="#059669" size={13} strokeWidth={2.2} />
                                        </View>
                                    )}
                                    {badgeType === 'flame' && (
                                        <View style={styles.badgeContainer}>
                                            <Flame color="#ea580c" size={13} strokeWidth={2.2} />
                                        </View>
                                    )}
                                    {badgeType === 'rocket' && (
                                        <View style={styles.badgeContainer}>
                                            <Rocket color="#7c3aed" size={13} strokeWidth={2.2} />
                                        </View>
                                    )}
                                    {!item.is_read && <View style={styles.unreadDot} />}
                                </View>

                                {/* Contenido de texto: Emoji + Título + Tiempo relativo + Body */}
                                <View style={styles.itemContent}>
                                    <View style={styles.itemHeader}>
                                        <Text
                                            style={[
                                                styles.itemTitle,
                                                item.is_read ? styles.titleRead : styles.titleUnread,
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {title}
                                        </Text>
                                        <Text style={styles.itemDate}>
                                            {relativeTime}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.itemBody,
                                            item.is_read ? styles.bodyRead : styles.bodyUnread,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {body}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Swipeable>
                    );
                }}
                ListEmptyComponent={renderEmpty}
            />

            {/* Snackbar flotante: Notificación eliminada + Deshacer (5 seg) */}
            {pendingDeletion && (
                <View style={styles.snackbar}>
                    <Text style={styles.snackbarText}>Notificación eliminada</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleUndoDelete}
                        style={styles.undoButton}
                    >
                        <Text style={styles.undoButtonText}>Deshacer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ============================================================================
// 4. Stylesheet (Diseño Wallapop)
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    itemContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemUnread: {
        backgroundColor: '#f8fafc', // Tinte sutil para destacar no leídas
    },
    itemRead: {
        backgroundColor: '#ffffff',
    },
    imageWrapper: {
        width: 58,
        height: 58,
        borderRadius: 14,
        marginRight: 14,
        position: 'relative',
    },
    productImage: {
        width: 58,
        height: 58,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
    },
    imageFallback: {
        width: 58,
        height: 58,
        borderRadius: 14,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#059669',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        left: -5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.15,
        shadowRadius: 2.5,
        elevation: 4,
        zIndex: 10,
    },
    itemContent: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    itemTitle: {
        fontSize: 15.5,
        flex: 1,
        marginRight: 8,
        lineHeight: 20,
    },
    titleUnread: {
        fontWeight: '700',
        color: '#1e293b',
    },
    titleRead: {
        fontWeight: '600',
        color: '#334155',
    },
    itemDate: {
        fontSize: 12.5,
        color: '#94a3b8',
        marginTop: 1,
    },
    itemBody: {
        fontSize: 14,
        lineHeight: 19,
    },
    bodyUnread: {
        color: '#475569',
    },
    bodyRead: {
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
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
        backgroundColor: '#1f2937',
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
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    undoButton: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginLeft: 12,
    },
    undoButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
});

// ============================================================================
// 5. Documentación de Memoria y Decisiones Técnicas (RULE[user_global])
// ============================================================================
/**
 * Decisiones Técnicas & Lecciones Aprendidas:
 * 1. Persistencia Local Inmune a Cambios de Vista (AsyncStorage Pattern):
 *    - Se replica la solución arquitectónica implementada en `@hidden_conversations_${userId}` para notificaciones
 *      mediante `@hidden_notifications_${userId}`.
 *    - Al pulsar "Borrar", el ID de la notificación se almacena de inmediato en AsyncStorage y se excluye del estado local.
 *    - En `fetchNotifications`, toda notificación listada en este mapa se excluye de forma determinista, evitando que
 *      reaparezca si el usuario navega a otra pantalla o pestaña y regresa.
 * 2. Superación del Bloqueo Silencioso de RLS en PostgreSQL:
 *    - La tabla `public.notifications` solo contaba con políticas `FOR SELECT` y `FOR UPDATE`. Supabase ignoraba
 *      silenciosamente peticiones `DELETE` desde clientes anónimos o autenticados sin arrojar error.
 *    - Se implementó el endpoint administrativo `POST /api/notifications/delete` que utiliza `supabaseAdmin` con
 *      la clave Service Role, verificando la identidad del usuario y eliminando físicamente la fila en base de datos.
 * 3. Actualización Optimista Instantánea del Badge Globo (0 ms):
 *    - Al borrar una notificación no leída, se ejecuta inmediatamente `decrementUnreadNotification()` en `UnreadContext`,
 *      lo que decrementa el contador del globo en la pestaña y en la barra de navegación al instante.
 *    - Se actualiza preventivamente `is_read = true` en base de datos para que ninguna consulta de fondo o suscripción
 *      realtime en `notifications` vuelva a inflar el badge.
 *    - Si el usuario pulsa "Deshacer", se ejecuta `incrementUnreadNotification()` y se restituye `is_read = false`.
 * 4. Temporizador de Deshacer de 5 Segundos:
 *    - Reducido exactamente de 10.000 ms a 5.000 ms (5 segundos), respetando la especificación del usuario.
 *    - Si el usuario desmonta el componente antes de agotarse los 5 segundos (por ejemplo, cambiando de pantalla),
 *      la función de limpieza (`return () => ...`) de `useEffect` consolida inmediatamente el borrado definitivo.
 * 5. Formato visual idéntico a Wallapop:
 *    - Thumbnail cuadrado de 58x58 con esquinas redondeadas (borderRadius: 14) en lugar de icono genérico.
 *    - Títulos y cuerpos con emojis contextuales (⭐ favoritos, ✨ nuevos anuncios, 💬 chat, 📉👀 precio, 🔥 cerca de vender, 🚀 renovar).
 * 6. Compatibilidad Android:
 *    - Mantenido `RectButton` de `react-native-gesture-handler` para garantizar la captura de toques en swipeable.
 * 7. Type Safety:
 *    - Cero 'any'. Tipado estricto con FormattedNotification, NotificationItem, NotificationBadgeType y Animated.AnimatedInterpolation.
 */
