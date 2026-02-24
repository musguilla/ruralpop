import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";

export default function FavoritesScreen() {
    const { session, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return null;

    if (!session) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-6">
                    <Heart className="text-primary" size={32} />
                </View>
                <Text className="text-xl font-bold text-center text-text mb-2">Inicia sesión para ver tus favoritos</Text>
                <Text className="text-center text-text-muted mb-8">
                    Guarda los anuncios que más te interesen para no perderlos de vista.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center bg-surface">
            <Text className="text-2xl font-bold text-text">Mis Favoritos</Text>
        </View>
    );
}
