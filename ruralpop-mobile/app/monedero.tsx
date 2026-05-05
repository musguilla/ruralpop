import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft, Wallet, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

export default function MonederoScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [wallet, setWallet] = useState<any>(null);
    const [isStripeReady, setIsStripeReady] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function fetchWallet() {
        if (!user) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = `${process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com'}/api/checkout/escrow/wallet-status`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) throw new Error("Error fetching wallet status");

            const data = await response.json();
            
            setWallet(data.wallet);
            setIsStripeReady(data.isStripeReady);

            if (data.wallet?.id) {
                const { data: txData } = await supabase
                    .from('escrow_orders')
                    .select('*, listings(title)')
                    .eq('seller_id', user.id)
                    .neq('status', 'pending_checkout')
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                setTransactions(txData || []);
            }
        } catch (error) {
            console.error('Error fetching wallet', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchWallet();
    }, [user]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWallet();
    };

    const handleStripeOnboarding = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = `${process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com'}/api/checkout/escrow/onboarding-link`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener el link de Stripe");
            }

            const { url } = await response.json();
            await WebBrowser.openBrowserAsync(url);
            
            // Refrescar al volver
            fetchWallet();
        } catch (error) {
            console.error(error);
            alert("Hubo un error al conectar con Stripe. Inténtalo de nuevo más tarde.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Mi Monedero</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#059669']} />}
                >
                    {!isStripeReady ? (
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 items-center mt-4">
                            <View className="w-16 h-16 bg-primary-muted/30 rounded-full items-center justify-center mb-4">
                                <ShieldCheck color="#059669" size={32} />
                            </View>
                            <Text className="text-xl font-bold text-text mb-2 text-center">Pagos 100% Seguros</Text>
                            <Text className="text-gray-500 text-center mb-6">
                                Para poder recibir pagos por tus ventas online, necesitamos verificar tu identidad por requerimiento legal europeo (KYC). Esto se hace de forma segura a través de Stripe.
                            </Text>
                            <TouchableOpacity
                                onPress={handleStripeOnboarding}
                                className="bg-primary w-full py-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Text className="text-white font-bold text-base mr-2">Configurar cobros</Text>
                                <ExternalLink color="white" size={18} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Saldo Disponible */}
                            <View className="bg-primary rounded-3xl p-6 shadow-sm mb-4 relative overflow-hidden">
                                <View className="absolute -right-6 -top-6 opacity-10">
                                    <Wallet color="white" size={120} />
                                </View>
                                <Text className="text-white/80 font-medium text-base mb-1">Saldo Disponible</Text>
                                <Text className="text-4xl font-extrabold text-white mb-6">
                                    {(wallet.available_balance_cents / 100).toFixed(2)} €
                                </Text>
                                <View className="bg-black/10 rounded-xl p-3 flex-row items-start">
                                    <AlertCircle color="white" size={16} className="mt-0.5 shrink-0" />
                                    <Text className="text-white/90 text-xs ml-2 flex-1">
                                        El saldo disponible se transferirá automáticamente a tu cuenta bancaria según la configuración de tu cuenta Stripe.
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row space-x-4 mb-6">
                                {/* Saldo Retenido */}
                                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                    <Text className="text-gray-500 text-sm mb-1">Saldo Retenido</Text>
                                    <Text className="text-2xl font-bold text-text">
                                        {(wallet.pending_balance_cents / 100).toFixed(2)} €
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-2">
                                        Se liberará cuando el comprador confirme la entrega.
                                    </Text>
                                </View>

                                {/* Total Ingresado */}
                                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                    <Text className="text-gray-500 text-sm mb-1">Histórico</Text>
                                    <Text className="text-2xl font-bold text-text">
                                        {(wallet.total_earned_cents / 100).toFixed(2)} €
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-2">
                                        Total acumulado en la plataforma.
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-end mb-4 mt-2">
                                <Text className="text-xl font-bold text-text">Últimas operaciones</Text>
                                <TouchableOpacity onPress={() => router.push('/ventas')}>
                                    <Text className="text-primary font-bold text-sm">Ver todas las ventas</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {transactions.length === 0 ? (
                                <Text className="text-gray-500 text-center py-4">No hay operaciones recientes.</Text>
                            ) : (
                                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    {transactions.map((tx, index) => {
                                        const isLast = index === transactions.length - 1;
                                        // Support both an array or a direct object if it's one-to-one
                                        const listingData = Array.isArray(tx.listings) ? tx.listings[0] : tx.listings;
                                        const listingTitle = listingData?.title || 'Pedido seguro';
                                        
                                        // Formato fecha simple
                                        const date = new Date(tx.created_at);
                                        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

                                        return (
                                            <View key={tx.id} className={`p-4 flex-row items-center justify-between ${!isLast ? 'border-b border-gray-50' : ''}`}>
                                                <View className="flex-1 pr-4">
                                                    <Text className="text-gray-800 font-medium mb-1" numberOfLines={1}>{listingTitle}</Text>
                                                    <Text className="text-gray-400 text-xs">{dateStr}</Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-text font-bold text-base mb-1">
                                                        {(tx.seller_net_amount_cents / 100).toFixed(2)} €
                                                    </Text>
                                                    {tx.status === 'paid_out' || tx.status === 'buyer_confirmed' ? (
                                                        <View className="bg-green-100 px-2 py-0.5 rounded-md">
                                                            <Text className="text-[10px] font-bold text-green-700">Liberado</Text>
                                                        </View>
                                                    ) : tx.status === 'paid_held' ? (
                                                        <View className="bg-orange-100 px-2 py-0.5 rounded-md">
                                                            <Text className="text-[10px] font-bold text-orange-700">Retenido</Text>
                                                        </View>
                                                    ) : tx.status === 'return_initiated' ? (
                                                        <View className="bg-red-100 px-2 py-0.5 rounded-md">
                                                            <Text className="text-[10px] font-bold text-red-700">Devolución</Text>
                                                        </View>
                                                    ) : (
                                                        <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                                                            <Text className="text-[10px] text-gray-500 uppercase">{tx.status.replace('_', ' ')}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
