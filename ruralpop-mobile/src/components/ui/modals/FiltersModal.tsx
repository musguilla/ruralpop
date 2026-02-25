import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { X, ChevronDown, Check } from 'lucide-react-native';

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
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-text">Filtros</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 -mr-2 bg-gray-50 rounded-full">
                        <X color="#6b7280" size={20} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                    <ScrollView className="flex-1 px-6 pt-4 pb-20" keyboardShouldPersistTaps="handled">
                        {/* Categoría */}
                        <View className="mb-6">
                            <Text className="text-[15px] font-bold text-gray-800 mb-2">Categoría</Text>
                            <TouchableOpacity
                                onPress={() => setIsCategoryModalOpen(true)}
                                className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 bg-white"
                            >
                                <Text className="text-base text-gray-800">{categoryLabel}</Text>
                                <View className="flex-row items-center">
                                    {categoryLabel !== 'Todas las categorías' && categoryLabel !== 'Categoría' && (
                                        <X color="#9ca3af" size={16} className="mr-2" />
                                    )}
                                    <ChevronDown color="#9ca3af" size={20} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Localización */}
                        <View className="mb-6">
                            <Text className="text-[15px] font-bold text-gray-800 mb-2">Localización</Text>
                            <TouchableOpacity
                                onPress={() => setIsLocationModalOpen(true)}
                                className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 bg-white"
                            >
                                <Text className="text-base text-gray-800">{locationLabel}</Text>
                                <ChevronDown color="#9ca3af" size={20} />
                            </TouchableOpacity>
                        </View>

                        {/* Precio */}
                        <View className="mb-6">
                            <Text className="text-[15px] font-bold text-gray-800 mb-2">Precio</Text>
                            <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
                                <View className="flex-1 flex-row items-center border border-gray-200 rounded-xl px-4 h-12 bg-white">
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Desde"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                        value={priceMin}
                                        onChangeText={setPriceMin}
                                        style={{ paddingVertical: 0 }}
                                    />
                                    <Text className="text-gray-500 text-base">€</Text>
                                </View>
                                <View className="flex-1 flex-row items-center border border-gray-200 rounded-xl px-4 h-12 bg-white">
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Hasta"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                        value={priceMax}
                                        onChangeText={setPriceMax}
                                        style={{ paddingVertical: 0 }}
                                    />
                                    <Text className="text-gray-500 text-base">€</Text>
                                </View>
                            </View>
                        </View>

                        {/* Tipo de vendedor (Oculto temporalmente) */}
                        {/* <View className="mb-8">
                            <Text className="text-[15px] font-bold text-gray-800 mb-2">Tipo de vendedor</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-xl p-1 bg-white">
                                {['Todos', 'Particular', 'Profesional'].map((type) => {
                                    const isSelected = sellerType === type;
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setSellerType(type)}
                                            className={`flex-1 items-center justify-center py-2.5 rounded-lg ${isSelected ? 'bg-white shadow-sm border border-gray-100' : ''}`}
                                        >
                                            <Text className={`text-[14px] ${isSelected ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View> */}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Buttons */}
                <View className="flex-row items-center justify-between p-4 border-t border-gray-100 bg-white">
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            onClear();
                        }}
                        className="px-4 py-3"
                    >
                        <Text className="text-primary font-bold text-base">Limpiar filtros</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            onApply();
                        }}
                        className="bg-primary px-6 py-3.5 rounded-xl flex-1 ml-4 items-center"
                    >
                        <Text className="text-white font-bold text-base">Ver resultados</Text>
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
