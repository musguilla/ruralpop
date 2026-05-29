import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Package, Clock, CheckCircle, Tag, Edit3, Trash2, PackageOpen, Sparkles } from 'lucide-react-native';
import { Image } from 'expo-image';
import { getOptimizedImageUrl } from '../src/lib/image-optimization';
import { Listing } from '../src/types';
import { ListingCard } from '../src/components/ui/ListingCard';
import { formatPrice } from '../src/lib/formatters';
import { getDefaultTenantFilterString } from '../src/config/tenants';
import { FeaturedCheckoutMobile } from '../src/components/upload/FeaturedCheckoutMobile';

export default function VentasScreen() {
    const { user } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<'en_venta' | 'en_curso' | 'finalizadas'>('en_venta');
    
    // Data states
    const [displayItems, setDisplayItems] = useState<any[]>([]);
    const [rawListings, setRawListings] = useState<Listing[]>([]);
    const [rawEscrows, setRawEscrows] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isStripeReady, setIsStripeReady] = useState(false);
    
    // Modal states for Mark as Sold
    const [soldModalVisible, setSoldModalVisible] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [soldPriceInput, setSoldPriceInput] = useState("");
    
    // Modal states for Featured
    const [featuredModalVisible, setFeaturedModalVisible] = useState(false);
    const [selectedFeaturedListingId, setSelectedFeaturedListingId] = useState<string | null>(null);

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

            await fetchData();
        } catch (error: any) {
            console.error('Escrow action error:', error);
            alert(error.message || "Hubo un error al procesar la acción.");
        } finally {
            setActionLoading(null);
        }
    };

    async function fetchData() {
        if (!user) return;
        setLoading(true);
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

            const { data: listingsData, error: listingsError } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .or(getDefaultTenantFilterString())
                .order('created_at', { ascending: false });

            if (escrowError) throw escrowError;
            if (listingsError) throw listingsError;

            setRawEscrows(escrowData || []);
            setRawListings((listingsData as Listing[]) || []);

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
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [user])
    );

    // Derived state for display
    useEffect(() => {
        if (activeTab === 'en_venta') {
            const activeListings = rawListings.filter(l => l.status === 'active').map(l => ({
                type: 'active_listing',
                data: l,
                date: new Date(l.created_at).getTime()
            }));
            setDisplayItems(activeListings);
        } else if (activeTab === 'en_curso') {
            const inProgressEscrows = rawEscrows.filter(e => e.status !== 'paid_out' && e.status !== 'refunded' && e.status !== 'cancelled').map(e => ({
                type: 'escrow',
                data: e,
                date: new Date(e.created_at).getTime()
            }));
            setDisplayItems(inProgressEscrows);
        } else if (activeTab === 'finalizadas') {
            const finishedEscrows = rawEscrows.filter(e => e.status === 'paid_out' || e.status === 'refunded' || e.status === 'cancelled');
            const escrowListingIds = new Set(finishedEscrows.map(o => o.listing_id));
            
            // Also exclude any listing that is currently "en_curso" just in case 
            const inProgressIds = new Set(rawEscrows.filter(e => e.status !== 'paid_out' && e.status !== 'refunded' && e.status !== 'cancelled').map(o => o.listing_id));
            
            const manualSoldListings = rawListings.filter(l => l.status === 'sold' && !escrowListingIds.has(l.id) && !inProgressIds.has(l.id));

            const escrowItems = finishedEscrows.map(o => ({ type: 'escrow', data: o, date: new Date(o.created_at).getTime() }));
            const manualItems = manualSoldListings.map(l => ({ type: 'manual_sold', data: l, date: new Date(l.created_at).getTime() }));

            const combinedItems = [...escrowItems, ...manualItems].sort((a, b) => b.date - a.date);
            setDisplayItems(combinedItems);
        }
    }, [activeTab, rawListings, rawEscrows]);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Anuncio",
            "¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('listings').delete().eq('id', id);
                        if (error) {
                            Alert.alert("Error", error.message);
                        } else {
                            setRawListings(prev => prev.filter(l => l.id !== id));
                        }
                    }
                }
            ]
        );
    };

    const handleMarkSold = async (id: string) => {
        setSelectedListingId(id);
        setSoldPriceInput("");
        setSoldModalVisible(true);
    };

    const submitSoldPrice = async () => {
        if (!selectedListingId) return;

        const numericPrice = parseFloat(soldPriceInput.replace(',', '.'));
        const finalPrice = isNaN(numericPrice) ? null : numericPrice;

        const { error } = await supabase
            .from('listings')
            .update({ status: 'sold', sold_price: finalPrice })
            .eq('id', selectedListingId);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setRawListings(prev => prev.map(l => l.id === selectedListingId ? { ...l, status: 'sold', sold_price: finalPrice } : l));
            setSoldModalVisible(false);
            setSelectedListingId(null);
            // Don't auto-switch tab, let the user see it disappeared from "en_venta"
        }
    };

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
        if (item.type === 'active_listing') {
            const listing = item.data as Listing;
            return (
                <View className="mb-6">
                    <View className="w-full self-center">
                        <ListingCard listing={listing} />
                    </View>

                    <View className="flex-row justify-between items-center mt-3 px-1">
                        <TouchableOpacity
                            onPress={() => handleMarkSold(listing.id)}
                            className="flex-row items-center px-4 py-2.5 rounded-2xl bg-primary-muted/30"
                        >
                            <CheckCircle color="#059669" size={18} />
                            <Text className="ml-2 font-bold text-primary">
                                Marcar Vendido
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => router.push(`/edit/${listing.id}`)}
                                className="w-14 h-11 bg-white rounded-2xl items-center justify-center border border-gray-200"
                            >
                                <Edit3 color="#6b7280" size={18} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDelete(listing.id)}
                                className="w-14 h-11 bg-red-50 rounded-2xl items-center justify-center border border-red-100"
                            >
                                <Trash2 color="#ef4444" size={18} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedFeaturedListingId(listing.id);
                                    setFeaturedModalVisible(true);
                                }}
                                className="w-14 h-11 bg-amber-50 rounded-2xl items-center justify-center border border-amber-200"
                            >
                                <Sparkles color="#d97706" size={18} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        // Both 'escrow' and 'manual_sold' use the legacy ventas.tsx UI format
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
                                ? `${formatPrice(order.seller_net_amount_cents / 100)} `
                                : listing?.sold_price 
                                    ? `${formatPrice(listing.sold_price)} ` 
                                    : `${formatPrice(listing?.price)} `
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
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Ventas</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white px-4 py-2 z-10">
                <TouchableOpacity
                    onPress={() => setActiveTab('en_venta')}
                    className={`flex-1 py-2 mx-1 items-center rounded-lg ${activeTab === 'en_venta' ? 'bg-primary/10' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'en_venta' ? 'text-primary' : 'text-gray-500'}`}>En venta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('en_curso')}
                    className={`flex-1 py-2 mx-1 items-center rounded-lg ${activeTab === 'en_curso' ? 'bg-blue-50' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'en_curso' ? 'text-blue-600' : 'text-gray-500'}`}>En curso</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('finalizadas')}
                    className={`flex-1 py-2 mx-1 items-center rounded-lg ${activeTab === 'finalizadas' ? 'bg-orange-50' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'finalizadas' ? 'text-orange-600' : 'text-gray-500'}`}>Finalizadas</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={displayItems}
                    keyExtractor={(item, index) => `${item.type}_${item.data?.id || index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            {activeTab === 'en_venta' ? (
                                <>
                                    <PackageOpen className="text-gray-300 mb-4" size={64} />
                                    <Text className="text-xl font-bold text-text mb-2 text-center">
                                        Aún no has publicado nada
                                    </Text>
                                    <Text className="text-gray-500 text-center px-6 mb-8">
                                        Anímate a subir tu primer anuncio. Es gratis y muy rápido.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/publish')}
                                        className="bg-primary px-8 py-3 rounded-full"
                                    >
                                        <Text className="text-white font-bold text-base">Publicar Anuncio</Text>
                                    </TouchableOpacity>
                                </>
                            ) : activeTab === 'en_curso' ? (
                                <>
                                    <Package className="text-gray-300 mb-4" size={64} />
                                    <Text className="text-xl font-bold text-text mb-2 text-center">
                                        No hay ventas en curso
                                    </Text>
                                    <Text className="text-gray-500 text-center px-6 mb-8">
                                        Aquí aparecerán tus ventas online que están en proceso.
                                    </Text>
                                    {!isStripeReady && (
                                        <TouchableOpacity
                                            onPress={() => router.push('/monedero')}
                                            className="bg-primary px-8 py-3 rounded-full mb-3 w-full max-w-[280px] items-center"
                                        >
                                            <Text className="text-white font-bold text-base">Configura tu monedero</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="text-gray-300 mb-4" size={64} />
                                    <Text className="text-xl font-bold text-text mb-2 text-center">
                                        No hay ventas finalizadas
                                    </Text>
                                    <Text className="text-gray-500 text-center px-6 mb-8">
                                        Tus anuncios marcados como vendidos y ventas online cobradas aparecerán aquí.
                                    </Text>
                                </>
                            )}
                        </View>
                    }
                />
            )}

            {/* Sold Price Modal */}
            <Modal
                transparent={true}
                visible={soldModalVisible}
                animationType="fade"
                onRequestClose={() => setSoldModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
                        <Text className="text-xl font-bold text-text mb-2 text-center">¡Enhorabuena por la venta!</Text>
                        <Text className="text-gray-500 text-center mb-6 text-sm">
                            Este anuncio desaparecerá de las búsquedas. Para ayudarnos a analizar el mercado, ¿podrías indicarnos el precio final de venta?
                        </Text>

                        <View className="relative justify-center mb-6">
                            <TextInput
                                className="bg-surface-muted border border-gray-200 rounded-2xl px-4 py-4 pr-10 text-center text-2xl font-bold text-text"
                                placeholder="0"
                                keyboardType="numeric"
                                value={soldPriceInput}
                                onChangeText={setSoldPriceInput}
                            />
                            <Text className="absolute right-4 text-2xl font-bold text-gray-400">€</Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setSoldModalVisible(false)}
                                className="flex-1 py-3 items-center rounded-full bg-gray-100"
                            >
                                <Text className="font-bold text-gray-600">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitSoldPrice}
                                className="flex-1 py-3 items-center rounded-full bg-primary"
                            >
                                <Text className="font-bold text-white">Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Featured Stripe Checkout Modal */}
            <Modal
                visible={featuredModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setFeaturedModalVisible(false)}
            >
                {selectedFeaturedListingId && (
                    <FeaturedCheckoutMobile 
                        listingId={selectedFeaturedListingId} 
                        onSkip={() => {
                            setFeaturedModalVisible(false);
                            setSelectedFeaturedListingId(null);
                        }} 
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}
