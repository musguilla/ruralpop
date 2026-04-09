import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { X, ChevronRight, Check } from 'lucide-react-native';

import { formatPrice } from '../../../lib/formatters';
import { CategoryModal } from './CategoryModal';
import { LocationModal } from './LocationModal';

const PRICE_OPTIONS = [
    0, 25, 50, 100, 250, 500, 1000, 2000, 3000, 4000, 5000, 
    6000, 7000, 8000, 9000, 10000, 15000, 20000, 30000, 40000, 50000, 75000, 100000
];

interface PricePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (val: string) => void;
    currentVal: string;
    isMax?: boolean;
}

function PricePickerModal({ visible, onClose, onSelect, currentVal, isMax }: PricePickerModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl h-[65%]">
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                            <X color="#374151" size={24} />
                        </TouchableOpacity>
                        <Text className="text-[19px] font-bold text-text">{isMax ? 'Precio Hasta' : 'Precio Desde'}</Text>
                        <View className="w-8" />
                    </View>
                    <ScrollView>
                        {PRICE_OPTIONS.map((val) => {
                            let valStr = val.toString();
                            if (val === 0 && !isMax) valStr = '';
                            if (val === 100000 && isMax) valStr = '';

                            const isSelected = currentVal === valStr || (!currentVal && valStr === '');
                            
                            return (
                                <TouchableOpacity 
                                    key={val} 
                                    onPress={() => onSelect(valStr)}
                                    className={`px-6 py-4 border-b border-gray-100 flex-row justify-between items-center ${isSelected ? 'bg-primary/5' : ''}`}
                                >
                                    <Text className={`text-[17px] ${isSelected ? 'text-primary font-bold' : 'text-gray-800'}`}>
                                        {formatPrice(val.toString())} €
                                    </Text>
                                    {isSelected && <Check color="#059669" size={20} />}
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

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
    
    // Price Picker states
    const [isMinPriceOpen, setIsMinPriceOpen] = useState(false);
    const [isMaxPriceOpen, setIsMaxPriceOpen] = useState(false);

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
                            
                            <TouchableOpacity 
                                onPress={() => setIsMinPriceOpen(true)}
                                className="flex-row items-center justify-between px-4 py-4 bg-white border border-gray-300 rounded-xl"
                                style={{ marginBottom: 24 }}
                            >
                                <Text className={`text-[17px] ${priceMin ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {priceMin ? `${formatPrice(priceMin)} €` : 'Desde'}
                                </Text>
                                <ChevronRight color="#4b5563" size={20} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => setIsMaxPriceOpen(true)}
                                className="flex-row items-center justify-between px-4 py-4 bg-white border border-gray-300 rounded-xl"
                            >
                                <Text className={`text-[17px] ${priceMax ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {priceMax ? `${formatPrice(priceMax)} €` : 'Hasta'}
                                </Text>
                                <ChevronRight color="#4b5563" size={20} />
                            </TouchableOpacity>
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

            <PricePickerModal 
                visible={isMinPriceOpen} 
                onClose={() => setIsMinPriceOpen(false)} 
                currentVal={priceMin}
                onSelect={(val) => {
                    setPriceMin(val);
                    setIsMinPriceOpen(false);
                }} 
            />

            <PricePickerModal 
                visible={isMaxPriceOpen} 
                onClose={() => setIsMaxPriceOpen(false)} 
                currentVal={priceMax}
                isMax={true}
                onSelect={(val) => {
                    setPriceMax(val);
                    setIsMaxPriceOpen(false);
                }} 
            />
        </Modal>
    );
}
