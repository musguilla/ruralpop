import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getOptimizedImageUrl } from "../../src/lib/image-optimization";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { User, ChevronRight, Briefcase, Handshake, Tag, Wallet } from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<{ name?: string; commercial_name?: string; avatar_url?: string } | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const fetchProfile = async () => {
            const { data } = await supabase.from('users').select('name, commercial_name, avatar_url').eq('id', user.id).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [user?.id]);

    const displayName = profile?.commercial_name || profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario Ruralpop';

    if (isLoading) return null;

    async function handleSignOut() {
        if (user?.id) {
            // Eliminar el token de este dispositivo para que no reciba push notification del usuario tras cerrar sesión
            await supabase.from('users').update({ expo_push_token: null }).eq('id', user.id);
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Error al cerrar sesión", error.message);
        } else {
            router.replace("/");
        }
    }

    const handleDeleteAccount = () => {
        Alert.alert(
            "Eliminar Cuenta",
            "Esta acción es irreversible. Se eliminarán permanentemente todos tus datos personales, tus anuncios publicados y tu historial de mensajes.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, eliminar mi cuenta",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.rpc('delete_user_account');
                            if (error) throw error;

                            // User deleted, sign out from local state
                            await supabase.auth.signOut();
                            router.replace("/");
                        } catch (error: any) {
                            Alert.alert(
                                "Error al eliminar la cuenta",
                                error.message || "Ha ocurrido un error inesperado al intentar borrar tu cuenta."
                            );
                        }
                    }
                }
            ]
        );
    };

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
                <Text className="text-2xl font-extrabold text-text">Mi Perfil</Text>
            </View>

            <ScrollView className="flex-1 bg-gray-50 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-6 items-center mb-8">
                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                        <Image
                            source={{ uri: profile?.avatar_url || user?.user_metadata?.avatar_url }}
                            className="mb-4 border border-gray-200 bg-white"
                            style={{ width: 84, height: 84, borderRadius: 42 }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-[84px] h-[84px] bg-primary-muted rounded-full items-center justify-center mb-4 border border-primary/10">
                            <Text className="text-[32px] font-bold text-primary uppercase">
                                {(displayName || 'U').charAt(0)}
                            </Text>
                        </View>
                    )}
                    <Text className="text-xl font-bold text-text mb-1">
                        {displayName}
                    </Text>
                    <Text className="text-text-muted">{user?.email}</Text>
                </View>

                {/* Sección Transacciones */}
                <View className="bg-white border-t border-gray-100 mb-3">
                    <TouchableOpacity
                        onPress={() => router.push('/compras')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <View className="flex-row items-center">
                            <Handshake color="#059669" size={22} />
                            <Text className="text-[17px] font-semibold text-gray-800 ml-3">Compras</Text>
                        </View>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/ventas')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <View className="flex-row items-center">
                            <Tag color="#059669" size={22} />
                            <Text className="text-[17px] font-semibold text-gray-800 ml-3">Ventas</Text>
                        </View>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/monedero')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <View className="flex-row items-center">
                            <Wallet color="#059669" size={22} />
                            <Text className="text-[17px] font-semibold text-gray-800 ml-3">Monedero</Text>
                        </View>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Subtitle / Separador */}
                <View className="bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => router.push('/my-listings')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <Text className="text-[17px] text-gray-800">Mis Anuncios</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/personal-data')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <Text className="text-[17px] text-gray-800">Mi cuenta</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/favorites')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <Text className="text-[17px] text-gray-800">Favoritos</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/messages')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <Text className="text-[17px] text-gray-800">Mensajes</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>
                </View>

                <View className="h-3 w-full bg-gray-50" />

                <View className="bg-white border-y border-gray-100">
                    <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100 opacity-70">
                        <View className="flex-row items-center flex-1 pr-4">
                            <Text className="text-[17px] text-gray-800 mr-3 shrink-0">¿Eres profesional?</Text>
                            <View className="bg-blue-100 px-2 py-1 rounded-full shrink-0">
                                <Text className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Próximamente</Text>
                            </View>
                        </View>
                        <Briefcase color="#9ca3af" size={20} />
                    </View>

                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        className="flex-row justify-between items-center px-6 py-5"
                    >
                        <Text className="text-[17px] font-medium text-red-600">Eliminar cuenta</Text>
                        <ChevronRight color="#fca5a5" size={20} />
                    </TouchableOpacity>
                </View>

                <View className="px-6 mt-10 mb-6">
                    <TouchableOpacity
                        onPress={handleSignOut}
                        className="flex-row items-center justify-center bg-white py-4 rounded-xl border border-gray-200"
                    >
                        <Text className="text-gray-800 font-bold text-base">Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
