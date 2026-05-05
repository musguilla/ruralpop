import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft, Package, Clock, CheckCircle, Tag } from 'lucide-react-native';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../src/lib/image-optimization';

export default function VentasScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isStripeReady, setIsStripeReady] = useState(true);

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

            await fetchMySales();
        } catch (error: any) {
            console.error('Escrow action error:', error);
            alert(error.message || "Hubo un error al procesar la acción.");
        } finally {
            setActionLoading(null);
        }
    };

    async function fetchMySales() {
        if (!user) return;
        try {
            const { data: escrowData, error: escrowError } = await supabase
                .from('escrow_orders')
                .select(`
                    id, status, seller_net_amount_cents, created_at, listing_id,
                    listings ( title, image_urls, price, sold_price )
                `)
                .eq('seller_id', user.id)
                .neq('status', 'pending_checkout')
                .order('created_at', { ascending: false });

            const { data: manualData, error: manualError } = await supabase
                .from('listings')
                .select('id, title, image_urls, price, sold_price, created_at, updated_at, status')
                .eq('user_id', user.id)
                .eq('status', 'sold')
                .order('created_at', { ascending: false });

            if (escrowError) throw escrowError;
            if (manualError) throw manualError;

            const escrowOrders = escrowData || [];
            const manualListings = manualData || [];

            const escrowListingIds = new Set(escrowOrders.map(o => o.listing_id));
            const manualSoldListings = manualListings.filter(l => !escrowListingIds.has(l.id));

            const escrowItems = escrowOrders.map(o => ({ type: 'escrow', data: o, date: new Date(o.created_at).getTime() }));
            const manualItems = manualSoldListings.map(l => ({ type: 'manual', data: l, date: new Date(l.updated_at || l.created_at).getTime() }));

            const combinedItems = [...escrowItems, ...manualItems].sort((a, b) => b.date - a.date);
            setOrders(combinedItems);

            // Fetch Stripe wallet status to show appropriate empty state
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const apiUrl = `${process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com'}/api/checkout/escrow/wallet-status`;
                const response = await fetch(apiUrl, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsStripeReady(data.isStripeReady);
                }
            }
        } catch (error) {
            console.error('Error fetching my sales', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMySales();
    }, [user]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Esperando pago', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock };
            case 'paid_held': return { label: 'Pagado - Listo para enviar', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package };
            case 'shipped': return { label: 'Enviado por ti', color: 'text-purple-600', bg: 'bg-purple-50', icon: Package };
            case 'delivered': return { label: 'Entregado - Esperando liberación', color: 'text-primary', bg: 'bg-primary-muted/20', icon: Clock };
            case 'return_initiated': return { label: 'Devolución Solicitada', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock };
            case 'paid_out': return { label: 'Completado y Cobrado', color: 'text-primary', bg: 'bg-primary-muted/20', icon: CheckCircle };
            case 'refunded': return { label: 'Cancelado/Reembolsado', color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock };
            default: return { label: status, color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isEscrow = item.type === 'escrow';
        const order = isEscrow ? item.data : null;
        const listing = isEscrow ? (Array.isArray(order.listings) ? order.listings[0] : order.listings) : item.data;
        
        const imageUrl = listing?.image_urls?.[0] ? getOptimizedImageUrl(listing.image_urls[0], { width: 200, height: 200 }) : null;
        const { label, color, bg, icon: StatusIcon } = isEscrow ? getStatusInfo(order.status) : { label: 'Venta manual (sin protección)', color: 'text-gray-500', bg: 'bg-gray-100', icon: Tag };

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
                            <Tag color="#9ca3af" size={24} />
                        </View>
                    )}
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-lg font-bold text-text mb-1" numberOfLines={2}>
                            {listing?.title || 'Producto desconocido'}
                        </Text>
                        <Text className="text-lg font-extrabold text-primary">
                            {isEscrow 
                                ? `${(order.seller_net_amount_cents / 100).toFixed(2)} € `
                                : listing?.sold_price 
                                    ? `${listing.sold_price.toFixed(2)} € ` 
                                    : `${listing?.price?.toFixed(2) || '0.00'} € `
                            }
                            {isEscrow && <Text className="text-sm font-normal text-gray-500">(Neto)</Text>}
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
                        {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </Text>
                </View>

                {isEscrow && order.status === 'paid_held' && (
                    <View className="p-4 bg-blue-50/50 border-t border-blue-100">
                        <Text className="text-sm text-blue-800 font-medium text-center">
                            ¡El comprador ya ha pagado! Prepara el paquete para el envío. Recibirás el dinero cuando lo reciba.
                        </Text>
                    </View>
                )}

                {/* Acciones de Escrow */}
                {isEscrow && order.status === 'return_initiated' && (
                    <View className="px-4 py-3 border-t border-gray-100 bg-white">
                        <TouchableOpacity
                            onPress={() => handleEscrowAction('confirm_return', order.id)}
                            disabled={!!actionLoading}
                            className="bg-emerald-600 py-2.5 rounded-xl items-center justify-center shadow-sm"
                        >
                            {actionLoading === `confirm_return_${order.id}` ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-bold text-sm">Confirmar Devolución Recibida</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Mis Ventas</Text>
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
                            <Tag className="text-gray-300 mb-4" size={64} />
                            <Text className="text-xl font-bold text-text mb-2">
                                No has vendido nada online aún
                            </Text>
                            <Text className="text-gray-500 text-center px-6 mb-8">
                                Activa la opción de "Venta Online" en tus anuncios para permitir que otros te compren con envío.
                            </Text>
                            
                            {!isStripeReady && (
                                <TouchableOpacity
                                    onPress={() => router.push('/monedero')}
                                    className="bg-primary px-8 py-3 rounded-full mb-3 w-full max-w-[280px] items-center"
                                >
                                    <Text className="text-white font-bold text-base">Configura tu monedero</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                onPress={() => router.push('/my-listings')}
                                className={`px-8 py-3 rounded-full w-full max-w-[280px] items-center ${
                                    !isStripeReady 
                                    ? 'bg-white border border-gray-300' 
                                    : 'bg-primary'
                                }`}
                            >
                                <Text className={`${!isStripeReady ? 'text-gray-700' : 'text-white'} font-bold text-base`}>
                                    Ir a Mis Anuncios
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
