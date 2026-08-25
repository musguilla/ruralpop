import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useRecentSearches } from '../../hooks/useRecentSearches';

interface Props {
    visible: boolean;
    onSelectSearch: (query: string) => void;
}

export function RecentSearchesOverlay({ visible, onSelectSearch }: Props) {
    const { recentSearches, clearSearches } = useRecentSearches();

    if (!visible) return null;

    return (
        <View className="absolute top-full left-0 right-0 bottom-0 bg-white z-50 h-screen" style={{ top: 0, marginTop: 0 }}>
            <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 px-4 py-6">
                {recentSearches.length > 0 && (
                    <>
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-lg font-bold text-gray-800">Búsquedas recientes</Text>
                            <TouchableOpacity onPress={clearSearches} className="px-2 py-1">
                                <Text className="text-teal-700 font-bold text-base">Borrar todo</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {recentSearches.map((search, index) => (
                            <TouchableOpacity
                                key={`${search}-${index}`}
                                className="flex-row items-center py-4 border-b border-gray-100"
                                onPress={() => onSelectSearch(search)}
                            >
                                <Clock color="#4b5563" size={22} className="mr-4" />
                                <Text className="text-gray-700 text-[17px]">{search}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
