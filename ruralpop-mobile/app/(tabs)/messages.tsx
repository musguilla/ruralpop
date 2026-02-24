import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function MessagesScreen() {
    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-xl font-bold text-gray-700 mb-2">Mensajes</Text>
                <Text className="text-gray-500 text-center">
                    Tus conversaciones aparecerán aquí próximamente.
                </Text>
            </View>
        </SafeAreaView>
    );
}
