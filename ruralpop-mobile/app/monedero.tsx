import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Wallet, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { formatPrice } from '../src/lib/formatters';

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

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Tu sesión ha expirado o es inválida por un cambio en tu cuenta. Por favor, cierra sesión y vuelve a entrar.");
                }
                throw new Error("Error fetching wallet status");
            }

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
        } catch (error: any) {
            console.error('Error fetching wallet', error);
            if (error.message?.includes('sesión ha expirado')) {
                alert(error.message);
            }
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

    const handleStripeLogin = async () => {
        if (!isStripeReady && !wallet?.stripe_connected_account_id) {
            alert("Aún no tienes tu cuenta bancaria configurada. Por favor, completa la verificación primero usando el botón de arriba.");
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = `${process.env.EXPO_PUBLIC_SITE_URL || 'https://www.ruralpop.com'}/api/checkout/escrow/login-link`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("not_found");
                }
                throw new Error("No se pudo obtener el link de Stripe");
            }

            const { url } = await response.json();
            await WebBrowser.openBrowserAsync(url);
            
            fetchWallet();
        } catch (error: any) {
            console.error(error);
            if (error.message === "not_found") {
                alert("Aún no tienes tu cuenta bancaria configurada. Por favor, completa la verificación primero.");
            } else {
                alert("Hubo un error al conectar con Stripe. Inténtalo de nuevo más tarde.");
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface-muted">
                <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                        <ChevronLeft color="#111827" size={28} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text ml-2">Monedero</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Monedero</Text>
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
                    {!isStripeReady && (
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-orange-200 items-center mt-4 mb-4">
                            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                                <AlertCircle color="#ea580c" size={32} />
                            </View>
                            <Text className="text-xl font-bold text-text mb-2 text-center">Verificación Pendiente</Text>
                            <Text className="text-gray-500 text-center mb-6">
                                Para poder recibir transferencias a tu banco, Stripe necesita verificar tu identidad por requerimientos legales europeos (KYC).
                            </Text>
                            <TouchableOpacity
                                onPress={handleStripeOnboarding}
                                className="bg-orange-600 w-full py-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Text className="text-white font-bold text-base mr-2">Completar verificación</Text>
                                <ExternalLink color="white" size={18} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {wallet ? (
                        <>
                            {/* Saldo Disponible */}
                            <View className="bg-primary rounded-3xl p-6 shadow-sm mb-4 relative overflow-hidden">
                                <View className="absolute -right-6 -top-6 opacity-10">
                                    <Wallet color="white" size={120} />
                                </View>
                                <Text className="text-white/80 font-medium text-base mb-1">Saldo Disponible</Text>
                                <Text className="text-4xl font-extrabold text-white mb-6">
                                    {formatPrice(wallet.available_balance_cents / 100)}
                                </Text>
                                <View className="bg-black/10 rounded-xl p-3 flex-row items-start">
                                    <AlertCircle color="white" size={16} className="mt-0.5 shrink-0" />
                                    <Text className="text-white/90 text-xs ml-2 flex-1">
                                        El saldo disponible se transferirá automáticamente a tu cuenta bancaria según la configuración de tu cuenta Stripe.
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3 mb-6">
                                {/* Saldo Retenido */}
                                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                    <Text className="text-gray-500 text-sm mb-1">Saldo Retenido</Text>
                                    <Text className="text-2xl font-bold text-text">
                                        {formatPrice(wallet.pending_balance_cents / 100)}
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-2">
                                        Se liberará cuando el comprador confirme la entrega.
                                    </Text>
                                </View>

                                {/* Total Ingresado */}
                                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                    <Text className="text-gray-500 text-sm mb-1">Histórico</Text>
                                    <Text className="text-2xl font-bold text-text">
                                        {formatPrice(wallet.total_earned_cents / 100)}
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-2">
                                        Total acumulado en la plataforma.
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-2 border-t border-gray-100">
                                <TouchableOpacity 
                                    onPress={() => router.push('/ventas?tab=finalizadas')}
                                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                                >
                                    <Text className="text-[17px] text-text font-medium">Historial de movimientos</Text>
                                    <ChevronRight color="#4b5563" size={20} />
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={handleStripeLogin}
                                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                                >
                                    <Text className="text-[17px] text-text font-medium">Datos bancarios</Text>
                                    <ChevronRight color="#4b5563" size={20} />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        // If there is no wallet AT ALL, show the original welcome banner
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
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
