import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { X, Check, Search, MapPin } from 'lucide-react-native';
import { LOCATIONS } from '../../../constants/locations';

interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
    selectedLocation: string | null;
    onSelect: (location: string | null) => void;
}

export function LocationModal({ visible, onClose, selectedLocation, onSelect }: LocationModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const activeList = useMemo(() => {
        const query = normalizeStr(searchQuery);
        return LOCATIONS
            .filter((loc: any) => normalizeStr(loc.name).includes(query) || normalizeStr(loc.province).includes(query));
    }, [searchQuery]);

    const handleSelect = (id: string | null) => {
        onSelect(id);
        onClose();
        setTimeout(() => setSearchQuery(''), 300);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setSearchQuery(''), 300);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white pt-2">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-text">Ubicación</Text>
                    <TouchableOpacity onPress={handleClose} className="p-2 -mr-2 bg-gray-50 rounded-full">
                        <X color="#6b7280" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 pt-4 pb-6 border-b border-gray-100">
                    <View className="flex-row items-center bg-white border border-gray-300 focus:border-primary rounded-xl h-12 px-4">
                        <Search color="#10b981" size={20} />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-800"
                            style={{ paddingVertical: 0 }}
                            placeholder="Buscar provincia o municipio"
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                    {/* Toda España */}
                    {(!searchQuery || "toda españa".includes(searchQuery.toLowerCase())) && (
                        <TouchableOpacity
                            onPress={() => handleSelect(null)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border mb-6 ${!selectedLocation ? 'bg-primary-muted/20 border-primary' : 'bg-white border-gray-200'}`}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${!selectedLocation ? 'bg-primary-muted/50' : 'bg-gray-100'}`}>
                                    <MapPin color={!selectedLocation ? "#059669" : "#6b7280"} size={22} />
                                </View>
                                <Text className={`text-base font-bold ${!selectedLocation ? 'text-primary' : 'text-text'}`}>
                                    Toda España
                                </Text>
                            </View>
                            {!selectedLocation && <Check color="#059669" size={24} />}
                        </TouchableOpacity>
                    )}

                    {/* Restricted to provinces for simplicity in this view, as per web */}
                    {activeList
                        .filter((loc: any) => loc.type === 'province')
                        .map((prov: any, index: number, array: any[]) => {
                            const isSelected = selectedLocation === prov.id || selectedLocation === prov.name;
                            const isLast = index === array.length - 1;

                            return (
                                <TouchableOpacity
                                    key={prov.id}
                                    onPress={() => handleSelect(prov.name)}
                                    className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className={`text-[17px] ${isSelected ? 'font-bold text-primary' : 'text-gray-800'}`}>
                                            {prov.name}
                                        </Text>
                                    </View>
                                    {isSelected && <Check color="#059669" size={24} />}
                                </TouchableOpacity>
                            );
                        })}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
