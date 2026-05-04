import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, ChevronLeft } from 'lucide-react-native';

export default function MessagesScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Mensajes</Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
                <View className="flex-1 justify-center items-center py-20">
                    <View className="w-24 h-24 bg-primary-muted rounded-full items-center justify-center mb-6">
                        <MessageSquare className="text-primary" size={48} />
                    </View>
                    <Text className="text-2xl font-bold text-text mb-2 text-center">Inbox Vacío</Text>
                    <Text className="text-text-muted text-center max-w-[280px]">
                        Aún no tienes mensajes nuevos. Cuando alguien se interese en tus anuncios o contactes a un vendedor, aparecerán aquí.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
