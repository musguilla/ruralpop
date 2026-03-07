import { View, Text, TouchableOpacity, Alert, Image, SafeAreaView, ScrollView } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { User, LogOut, Heart, MessageCircle, Briefcase } from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";

export default function ProfileScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return null;

    async function handleSignOut() {
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
            <View className="px-6 py-4 border-b border-gray-100 bg-white">
                <Text className="text-2xl font-extrabold text-text">Mi Perfil</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>

                <View className="bg-surface-muted p-6 rounded-2xl border border-gray-100 mb-8 items-center">
                    {user?.user_metadata?.avatar_url ? (
                        <Image
                            source={{ uri: user.user_metadata.avatar_url }}
                            className="w-20 h-20 rounded-full mb-4 border border-gray-200"
                        />
                    ) : (
                        <View className="w-20 h-20 bg-primary-muted rounded-full items-center justify-center mb-4">
                            <User className="text-primary" size={40} />
                        </View>
                    )}
                    <Text className="text-xl font-bold text-text mb-1">
                        {user?.user_metadata?.full_name || 'Usuario Ruralpop'}
                    </Text>
                    <Text className="text-text-muted mb-4">{user?.email}</Text>
                </View>

                <View className="mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/my-listings')}
                        className="bg-white border border-gray-100 p-4 rounded-xl flex-row justify-between items-center shadow-sm mb-4"
                    >
                        <Text className="text-base font-bold text-text">Mis Anuncios</Text>
                        <Text className="text-primary font-bold">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/personal-data')}
                        className="bg-white border border-gray-100 p-4 rounded-xl flex-row justify-between items-center shadow-sm mb-4"
                    >
                        <Text className="text-base font-bold text-text">Mi cuenta</Text>
                        <Text className="text-primary font-bold">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/favorites')}
                        className="bg-white border border-gray-100 p-4 rounded-xl flex-row justify-between items-center shadow-sm mb-4"
                    >
                        <Text className="text-base font-bold text-text">Favoritos</Text>
                        <Text className="text-primary font-bold">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/messages')}
                        className="bg-white border border-gray-100 p-4 rounded-xl flex-row justify-between items-center shadow-sm mb-4"
                    >
                        <Text className="text-base font-bold text-text">Mensajes</Text>
                        <Text className="text-primary font-bold">→</Text>
                    </TouchableOpacity>

                    <View className="bg-white border border-gray-100 p-4 rounded-xl flex-row justify-between items-center shadow-sm mb-4 opacity-70">
                        <View className="flex-col">
                            <View className="bg-blue-100 self-start px-2 py-0.5 rounded-full mb-1">
                                <Text className="text-[10px] uppercase font-bold text-blue-700">Próximamente</Text>
                            </View>
                            <Text className="text-base font-bold text-text">¿Eres profesional?</Text>
                        </View>
                        <Briefcase color="#9ca3af" size={20} />
                    </View>

                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        className="bg-white border border-red-200 p-4 rounded-xl flex-row justify-between items-center shadow-sm"
                    >
                        <Text className="text-base font-bold text-red-600">Eliminar cuenta</Text>
                        <Text className="text-red-500 font-bold">×</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center justify-center bg-red-50 py-4 rounded-xl border border-red-100"
                >
                    <LogOut className="text-red-500 mr-2" size={20} />
                    <Text className="text-red-600 font-bold text-base">Cerrar Sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
