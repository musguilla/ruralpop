import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getOptimizedImageUrl } from "../../src/lib/image-optimization";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { User, ChevronRight, Briefcase, Handshake, Tag, Wallet, Heart, Settings, MessageSquare, BadgeCheck } from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<{ name?: string; commercial_name?: string; avatar_url?: string; role?: string; company_logo_url?: string; created_at?: string } | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const fetchProfile = async () => {
            const { data } = await supabase.from('users').select('name, commercial_name, avatar_url, role, created_at').eq('id', user.id).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [user?.id]);

    const displayName = profile?.commercial_name || profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario Ruralpop';
    const avatarUrl = profile?.company_logo_url || profile?.avatar_url || user?.user_metadata?.avatar_url;
    const joinedYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

    if (isLoading) return null;



    if (!session) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-6">
                    <User className="text-primary" size={32} />
                </View>
                <Text className="text-xl font-bold text-center text-text mb-2">Tu perfil en Ruralpop</Text>
                <Text className="text-center text-text-muted mb-8">
                    Inicia sesión para editar tu perfil, gestionar tus anuncios y revisar tus mensajes.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full mb-2 w-full items-center"
                >
                    <Text className="text-white font-bold text-base">Iniciar sesión</Text>
                </TouchableOpacity>
                <Text className="text-text-muted mt-4 mb-4">Si no tienes una cuenta</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="border-2 border-primary px-8 py-3 rounded-full w-full items-center"
                >
                    <Text className="text-primary font-bold text-base">Registrarme</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <View 
                className="px-6 pb-4 border-b border-gray-100 bg-white"
                style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 16 }}
            >
                <Text className="text-2xl font-extrabold text-text">Perfil</Text>
            </View>

            <ScrollView className="flex-1 bg-gray-50 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <TouchableOpacity 
                    onPress={() => router.push(`/user/${user?.id}`)}
                    className="px-6 flex-row items-center mb-8 bg-white py-4 border-b border-gray-100"
                >
                    <View className="relative mr-4">
                        {avatarUrl ? (
                            <View 
                                className="border border-gray-200 bg-white overflow-hidden"
                                style={{ width: 72, height: 72, borderRadius: 36 }}
                            >
                                <Image
                                    source={{ uri: getOptimizedImageUrl(avatarUrl) || avatarUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    transition={200}
                                />
                            </View>
                        ) : (
                            <View className="w-[72px] h-[72px] bg-primary-muted rounded-full items-center justify-center border border-primary/10">
                                <Text className="text-[28px] font-bold text-primary uppercase">
                                    {(displayName || 'U').charAt(0)}
                                </Text>
                            </View>
                        )}
                        
                        {profile?.role === 'profesional' && (
                            <View className="absolute bottom-0 -right-1 bg-white rounded-full border border-gray-50 shadow-sm items-center justify-center" style={{ width: 24, height: 24 }}>
                                <BadgeCheck color="#3b82f6" fill="#3b82f6" size={20} stroke="#ffffff" strokeWidth={2} /> 
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-1 justify-center">
                        <Text className="text-xl font-extrabold text-text mb-1" numberOfLines={1}>
                            {displayName}
                        </Text>
                        <Text className="text-text-muted text-[15px]">En Ruralpop desde {joinedYear}</Text>
                        {user?.email && <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>{user.email}</Text>}
                    </View>
                    
                    <View className="ml-2">
                        <ChevronRight color="#9ca3af" size={24} />
                    </View>
                </TouchableOpacity>

                {/* Sección Transacciones */}
                <View className="px-6 mb-2 mt-4">
                    <Text className="text-[15px] font-bold text-gray-800">Transacciones</Text>
                </View>

                <View className="bg-white border-y border-gray-100 mb-6">
                    <TouchableOpacity
                        onPress={() => router.push('/compras')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-50"
                    >
                        <View className="flex-row items-center">
                            <Handshake color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Compras</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/ventas')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-50"
                    >
                        <View className="flex-row items-center">
                            <Tag color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Ventas</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/monedero')}
                        className="flex-row justify-between items-center px-6 py-5"
                    >
                        <View className="flex-row items-center">
                            <Wallet color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Monedero</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Sección Cuenta */}
                <View className="px-6 mb-2">
                    <Text className="text-[15px] font-bold text-gray-800">Cuenta</Text>
                </View>

                <View className="bg-white border-y border-gray-100 mb-6">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/favorites')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-50"
                    >
                        <View className="flex-row items-center">
                            <Heart color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Favoritos</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/messages')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-50"
                    >
                        <View className="flex-row items-center">
                            <MessageSquare color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Mensajes</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/ajustes')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-50"
                    >
                        <View className="flex-row items-center">
                            <Settings color="#374151" size={24} strokeWidth={1.5} />
                            <Text className="text-[17px] text-gray-700 ml-4">Ajustes</Text>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center px-6 py-5 opacity-70">
                        <View className="flex-row items-center flex-1 pr-4">
                            <Briefcase color="#374151" size={24} strokeWidth={1.5} />
                            <View className="flex-row items-center ml-4 flex-1">
                                <Text className="text-[17px] text-gray-700 mr-3 shrink-0">Ruralpop PRO</Text>
                                <View className="bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                                    <Text className="text-[10px] uppercase font-bold text-primary tracking-wider">Próximamente</Text>
                                </View>
                            </View>
                        </View>
                        <ChevronRight color="#d1d5db" size={20} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
