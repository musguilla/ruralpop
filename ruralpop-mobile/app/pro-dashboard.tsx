import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { ArrowLeft, TrendingUp, RefreshCw, ShieldCheck, Zap, ChevronRight } from 'lucide-react-native';
import { getDefaultTenantFilterString } from '../src/config/tenants';

interface ProUserStats {
    plan_type: string;
    available_bumps: number;
    available_featured: number;
    activeListingsCount: number;
    totalListingsCount: number;
}

export default function ProDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [stats, setStats] = useState<ProUserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchProData = async () => {
            setLoading(true);
            try {
                // Fetch user plan details
                const { data: publicUser, error: userError } = await supabase
                    .from('users')
                    .select('plan_type, available_bumps, available_featured, role')
                    .eq('id', user.id)
                    .single();

                if (userError || !publicUser || publicUser.role !== 'profesional') {
                    // Redirect back if not pro or error
                    router.back();
                    return;
                }

                // Fetch counts using EXACT (head: true)
                const { count: activeCount } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .or(getDefaultTenantFilterString());
                
                const { count: totalCount } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .or(getDefaultTenantFilterString());

                setStats({
                    plan_type: publicUser.plan_type || 'start',
                    available_bumps: publicUser.available_bumps || 0,
                    available_featured: publicUser.available_featured || 0,
                    activeListingsCount: activeCount || 0,
                    totalListingsCount: totalCount || 0,
                });

            } catch (error) {
                console.error("Error fetching pro dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProData();
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#111827" />
            </SafeAreaView>
        );
    }

    if (!stats) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center px-6">
                <Text className="text-lg font-bold text-text mb-4">No se pudieron cargar los datos profesionales.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isStartPlan = stats.plan_type === 'start';
    const isProPlan = stats.plan_type === 'pro';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View 
                className="px-4 pb-4 flex-row items-center justify-between border-b border-gray-100 bg-white"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                        <ArrowLeft color="#374151" size={24} />
                    </TouchableOpacity>
                    <Text className="text-xl font-extrabold text-text">Panel Profesional</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Intro Section */}
                <View className="flex-row items-center bg-white rounded-3xl p-5 mb-6 border border-gray-100 shadow-sm">
                    <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center mr-4">
                        <ShieldCheck color="#d97706" size={32} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <View className={`px-2 py-1 rounded-md ${isProPlan ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                <Text className={`text-[10px] uppercase font-bold tracking-wider ${isProPlan ? 'text-amber-700' : 'text-gray-700'}`}>
                                    PLAN {stats.plan_type.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-sm text-text-muted mt-1 leading-tight">
                            Gestiona tus anuncios y promociones para acelerar tus ventas.
                        </Text>
                    </View>
                </View>

                {/* Resumen del Negocio */}
                <View className="bg-white rounded-3xl p-5 mb-6 border border-gray-100 shadow-sm">
                    <View className="flex-row items-center mb-5">
                        <TrendingUp color="#059669" size={20} className="mr-2" />
                        <Text className="text-lg font-bold text-text ml-2">Resumen del Negocio</Text>
                    </View>

                    <View className="flex-row justify-between space-x-4">
                        {/* Anuncios Activos */}
                        <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Anuncios Activos</Text>
                            <View className="flex-row items-end">
                                <Text className="text-4xl font-black text-text">{stats.activeListingsCount}</Text>
                                <Text className="text-sm text-gray-400 font-bold ml-1 mb-1">
                                    / {isStartPlan ? '15' : isProPlan ? '50' : '∞'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => { router.push('/ventas'); }}
                                className="mt-4 flex-row items-center"
                            >
                                <Text className="text-primary font-bold text-xs mr-1">Gestionar</Text>
                                <ChevronRight color="#059669" size={14} />
                            </TouchableOpacity>
                        </View>

                        {/* Anuncios Totales */}
                        <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Anuncios Totales</Text>
                            <View className="flex-row items-end">
                                <Text className="text-4xl font-black text-text">{stats.totalListingsCount}</Text>
                                <Text className="text-sm text-gray-400 font-bold ml-1 mb-1">históricos</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Promociones Mensuales */}
                <View className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <View className="bg-green-50 p-5 border-b border-green-100">
                        <View className="flex-row items-center mb-1">
                            <Zap color="#059669" size={20} fill="#059669" className="mr-2" />
                            <Text className="text-lg font-bold text-green-800 ml-2">Tus Promociones</Text>
                        </View>
                        <Text className="text-xs text-green-700 mt-1">Beneficios incluidos mensualmente.</Text>
                    </View>
                    
                    <View className="p-5">
                        {/* Impulsos */}
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center flex-1 pr-4">
                                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                                    <RefreshCw color="#16a34a" size={22} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-text text-base">Impulsos gratis</Text>
                                    <Text className="text-xs text-text-muted mt-1 leading-tight">Sube tus anuncios a las primeras páginas.</Text>
                                </View>
                            </View>
                            <View className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 items-center justify-center min-w-[70px]">
                                <Text className="text-2xl font-black text-green-700">{stats.available_bumps}</Text>
                                <Text className="text-[9px] text-green-600 font-bold uppercase tracking-wider mt-1">Disp.</Text>
                            </View>
                        </View>

                        {/* Destacados */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 pr-4">
                                <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mr-4">
                                    <ShieldCheck color="#d97706" size={22} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-text text-base">Anuncios Destacados</Text>
                                    <Text className="text-xs text-text-muted mt-1 leading-tight">Colócalos en lugares preferentes.</Text>
                                </View>
                            </View>
                            <View className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 items-center justify-center min-w-[70px]">
                                <Text className="text-2xl font-black text-amber-700">{stats.available_featured}</Text>
                                <Text className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-1">Disp.</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Esta vista replica la experiencia básica del dashboard PRO web.
 * - Evitamos usar pasarelas de pago o enlaces externos para "Gestionar Suscripción" 
 *   para evitar el rechazo de la App Store, tal y como se acordó con el usuario.
 * - Los conteos de supabase se hacen optimizados con `{ count: 'exact', head: true }` y filtrados por tenant.
 */
