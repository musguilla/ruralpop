import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft, Package, Clock, CheckCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../src/lib/image-optimization';
import { formatPrice } from '../src/lib/formatters';
import { IS_EQUIPOP } from '../src/config/tenants';

export default function ComprasScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleEscrowAction = async (action: string, orderId: string) => {
        setActionLoading(`${action}_${orderId}`);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const apiUrl = `${process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com'}/api/checkout/escrow/action`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ action, orderId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error performing action');
            }

            await fetchMyPurchases();
        } catch (error: any) {
            console.error('Escrow action error:', error);
            alert(error.message || "Hubo un error al procesar la acción.");
        } finally {
            setActionLoading(null);
        }
    };

    async function fetchMyPurchases() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('escrow_orders')
                .select(`
                    id, status, gross_amount_cents, created_at,
                    listings ( title, image_urls )
                `)
                .eq('buyer_id', user.id)
                .neq('status', 'pending_checkout')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching my purchases', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyPurchases();
    }, [user]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Pendiente de pago', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock };
            case 'paid_held': return { label: 'Pagado - Preparando envío', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package };
            case 'shipped': return { label: 'Enviado', color: 'text-purple-600', bg: 'bg-purple-50', icon: Package };
            case 'delivered': return { label: 'Entregado', color: 'text-primary', bg: 'bg-primary-muted/20', icon: CheckCircle };
            case 'paid_out': return { label: 'Completado', color: 'text-primary', bg: 'bg-primary-muted/20', icon: CheckCircle };
            case 'refunded': return { label: 'Reembolsado', color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock };
            default: return { label: status, color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const listing = Array.isArray(item.listings) ? item.listings[0] : item.listings;
        const imageUrl = listing?.image_urls?.[0] ? getOptimizedImageUrl(listing.image_urls[0], { width: 200, height: 200 }) : null;
        const { label, color, bg, icon: StatusIcon } = getStatusInfo(item.status);

        return (
            <View className="mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <View className="flex-row p-4 border-b border-gray-50">
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            className="w-20 h-20 rounded-xl bg-gray-100"
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
                            <Package color="#9ca3af" size={24} />
                        </View>
                    )}
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-lg font-bold text-text mb-1" numberOfLines={2}>
                            {listing?.title || 'Producto desconocido'}
                        </Text>
                        <Text className="text-lg font-extrabold text-primary">
                            {formatPrice(item.gross_amount_cents / 100)}
                        </Text>
                    </View>
                </View>

                <View className={`px-4 py-3 flex-row items-center justify-between ${bg}`}>
                    <View className="flex-row items-center flex-1 pr-4">
                        <StatusIcon color={color.replace('text-', '') === 'primary' ? '#059669' : color.includes('orange') ? '#f97316' : color.includes('blue') ? '#2563eb' : '#9ca3af'} size={18} />
                        <Text className={`ml-2 font-bold ${color}`} numberOfLines={1}>
                            {label}
                        </Text>
                    </View>
                    <Text className="text-xs text-gray-500 font-medium">
                        {new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </Text>
                </View>

                {/* Acciones de Escrow */}
                {(item.status === 'paid_held' || item.status === 'awaiting_delivery') && (
                    <View className="px-4 py-3 border-t border-gray-100 flex-row gap-2 bg-white">
                        <TouchableOpacity
                            onPress={() => handleEscrowAction('initiate_return', item.id)}
                            disabled={!!actionLoading}
                            className="flex-1 bg-white border border-gray-300 py-2.5 rounded-xl items-center justify-center opacity-90"
                        >
                            {actionLoading === `initiate_return_${item.id}` ? (
                                <ActivityIndicator color="#4b5563" size="small" />
                            ) : (
                                <Text className="text-gray-700 font-bold text-sm">Tengo un problema</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleEscrowAction('confirm_reception', item.id)}
                            disabled={!!actionLoading}
                            className="flex-[1.5] bg-emerald-600 py-2.5 rounded-xl items-center justify-center shadow-sm"
                        >
                            {actionLoading === `confirm_reception_${item.id}` ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-bold text-sm">Confirmar Recepción</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Compras</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <Package className="text-gray-300 mb-4" size={64} />
                            <Text className="text-xl font-bold text-text mb-2">
                                No tienes ninguna compra
                            </Text>
                            <Text className="text-gray-500 text-center mt-2 px-8">
                                Las compras seguras que realices en {IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} aparecerán aquí.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/')}
                                className="bg-primary px-8 py-3 rounded-full mt-8"
                            >
                                <Text className="text-white font-bold text-base">Descubrir anuncios</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
