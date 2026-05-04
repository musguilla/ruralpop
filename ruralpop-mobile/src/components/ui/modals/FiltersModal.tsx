import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard, TextInput } from 'react-native';
import { X, ChevronRight, Check } from 'lucide-react-native';

import { formatPrice } from '../../../lib/formatters';
import { CategoryModal } from './CategoryModal';
import { LocationModal } from './LocationModal';

interface FiltersModalProps {
    visible: boolean;
    onClose: () => void;
    categoryLabel: string;
    locationLabel: string;
    categoryId: string | null;
    setCategoryId: (val: string | null) => void;
    locationId: string | null;
    setLocationId: (val: string | null) => void;
    // Price
    priceMin: string;
    setPriceMin: (val: string) => void;
    priceMax: string;
    setPriceMax: (val: string) => void;
    sellerType: string;
    setSellerType: (val: string) => void;
    // Apply
    onApply: () => void;
    onClear: () => void;
}

export function FiltersModal({
    visible, onClose, categoryLabel, locationLabel,
    categoryId, setCategoryId, locationId, setLocationId,
    priceMin, setPriceMin, priceMax, setPriceMax, sellerType, setSellerType, onApply, onClear
}: FiltersModalProps) {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white pt-2">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={onClose} className="mr-4">
                            <X color="#374151" size={24} />
                        </TouchableOpacity>
                        <Text className="text-[19px] font-bold text-text">Filtros</Text>
                    </View>
                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClear(); }}>
                        <Text className="text-primary font-bold text-base">Borrar todo</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                    <ScrollView className="flex-1 bg-white pb-20" keyboardShouldPersistTaps="handled">
                        


                        {/* Categoría Section */}
                        <TouchableOpacity
                            onPress={() => setIsCategoryModalOpen(true)}
                            className="flex-row items-center justify-between bg-white px-6 py-5"
                        >
                            <Text className="text-[17px] text-gray-800">Categoría</Text>
                            <View className="flex-row items-center">
                                <Text className={(categoryLabel !== 'Todas las categorías' && categoryLabel !== 'Categoría') ? "text-[17px] text-primary mr-2" : "text-[17px] text-gray-500 mr-2"}>
                                    {categoryLabel}
                                </Text>
                                <ChevronRight color="#9ca3af" size={20} />
                            </View>
                        </TouchableOpacity>

                        <View className="h-2 w-full bg-gray-50" />

                        {/* Localización Section */}
                        <TouchableOpacity
                            onPress={() => setIsLocationModalOpen(true)}
                            className="flex-row items-center justify-between px-6 py-5 border-b border-gray-100 bg-white"
                        >
                            <Text className="text-[17px] text-gray-800">Ubicación</Text>
                            <View className="flex-row items-center">
                                <Text className={(locationLabel !== 'Toda España' && locationLabel !== 'Ubicación') ? "text-[17px] text-primary mr-2" : "text-[17px] text-gray-500 mr-2"}>
                                    {locationLabel}
                                </Text>
                                <ChevronRight color="#9ca3af" size={20} />
                            </View>
                        </TouchableOpacity>

                        <View className="h-2 w-full bg-gray-50" />

                        {/* Precio Section */}
                        <View className="px-6 py-6 border-b border-gray-100">
                            <Text className="text-[17px] font-bold text-gray-800 mb-4">Precio</Text>
                            
                            <View className="flex-row items-center justify-between px-4 py-4 bg-white border border-gray-300 rounded-xl" style={{ marginBottom: 24 }}>
                                <TextInput
                                    className="flex-1 text-[17px] text-gray-900 font-medium"
                                    placeholder="Desde"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={priceMin}
                                    onChangeText={setPriceMin}
                                    returnKeyType="done"
                                />
                                <Text className="text-[17px] text-gray-500 ml-2">€</Text>
                            </View>

                            <View className="flex-row items-center justify-between px-4 py-4 bg-white border border-gray-300 rounded-xl">
                                <TextInput
                                    className="flex-1 text-[17px] text-gray-900 font-medium"
                                    placeholder="Hasta"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={priceMax}
                                    onChangeText={setPriceMax}
                                    returnKeyType="done"
                                />
                                <Text className="text-[17px] text-gray-500 ml-2">€</Text>
                            </View>
                        </View>

                        <View className="h-8 w-full bg-white" />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Buttons */}
                <View className="px-6 py-4 border-t border-gray-100 bg-white items-center">
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            onApply();
                        }}
                        style={{ backgroundColor: '#059669' }}
                        className="w-full py-4 rounded-full flex-row justify-center items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">Mostrar resultados</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Nested Modals */}
            <CategoryModal
                visible={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                selectedCategory={categoryId}
                onSelect={setCategoryId}
            />

            <LocationModal
                visible={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                selectedLocation={locationId}
                onSelect={setLocationId}
            />

        </Modal>
    );
}
