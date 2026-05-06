import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function AjustesScreen() {
    const { user } = useAuth();
    const router = useRouter();

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

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            {/* Header */}
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <View className="flex-1 items-center pr-6">
                    <Text className="text-xl font-bold text-text">Ajustes</Text>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
                
                <View className="bg-white border-b border-gray-100">
                    <TouchableOpacity
                        onPress={() => router.push('/personal-data')}
                        className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100"
                    >
                        <Text className="text-[17px] text-gray-800">Editar perfil</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSignOut}
                        className="flex-row justify-between items-center px-6 py-5"
                    >
                        <Text className="text-[17px] text-gray-800">Cerrar sesión</Text>
                        <ChevronRight color="#9ca3af" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Footer flexible con Eliminar Cuenta */}
                <View className="flex-1 justify-end items-center pb-8 pt-12">
                    <TouchableOpacity onPress={handleDeleteAccount} className="p-4">
                        <Text className="text-gray-400 font-medium text-[15px] underline" style={{ textDecorationLine: 'underline', textDecorationColor: '#9ca3af' }}>
                            Eliminar cuenta de Ruralpop
                        </Text>
                    </TouchableOpacity>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}
