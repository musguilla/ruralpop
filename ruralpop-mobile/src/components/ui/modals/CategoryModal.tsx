import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { X, Check, ChevronRight, ChevronLeft, Search, List, PawPrint, Tractor, Leaf, Briefcase, Apple, LayoutGrid } from 'lucide-react-native';
import { Image } from 'expo-image';
import { CATEGORIES } from '../../../constants/categories';
import { IS_EQUIPOP } from '../../../config/tenants';

interface CategoryModalProps {
    visible: boolean;
    onClose: () => void;
    selectedCategory: string | null;
    onSelect: (category: string | null) => void;
}

const ICONS: Record<string, any> = {
    ganaderia: PawPrint,
    maquinaria: Tractor,
    forraje: Leaf,
    servicios: Briefcase,
    alimentos: Apple,
    fincas: (props: any) => <Image source={require('../../../../assets/icon-fincas.webp')} style={{ width: props.size, height: props.size }} contentFit="contain" />,
    agricultura: (props: any) => <Image source={require('../../../../assets/icon-agricultura.png')} style={{ width: props.size, height: props.size }} contentFit="contain" />,
};

export function CategoryModal({ visible, onClose, selectedCategory, onSelect }: CategoryModalProps) {
    const [activeParentId, setActiveParentId] = useState<string | null>(null);

    const activeParent = useMemo(() => CATEGORIES.find(c => c.id === activeParentId), [activeParentId]);



    const activeList = useMemo(() => {
        if (activeParent) {
            const subs = activeParent.subcategories
                .map((sub: string) => ({ id: sub, label: sub, isSub: true }));
            return [{ id: activeParent.id, label: `Ver todo`, isSub: true, isAllOption: true }, ...subs];
        }
        return CATEGORIES
            .map((c: any) => ({
                id: c.id,
                label: c.label,
                hasSub: c.subcategories && c.subcategories.length > 0,
                isSub: false
            }));
    }, [activeParent]);

    const handleSelect = (id: string | null) => {
        onSelect(id);
        onClose();
        // Reset state after a short delay to allow closing animation
        setTimeout(() => {
            setActiveParentId(null);
        }, 400);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setActiveParentId(null);
        }, 300);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white pt-2">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                        {activeParentId && (
                            <TouchableOpacity onPress={() => setActiveParentId(null)} className="mr-3 p-1 rounded-full bg-gray-100">
                                <ChevronLeft color="#374151" size={24} />
                            </TouchableOpacity>
                        )}
                        <Text className="text-xl font-bold text-text">
                            {activeParent ? activeParent.label : 'Categorías'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleClose} className="p-2 -mr-2 bg-gray-50 rounded-full">
                        <X color="#6b7280" size={20} />
                    </TouchableOpacity>
                </View>



                <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                    {/* Todas las categorías - only show in root level */}
                    {!activeParent && (
                        <TouchableOpacity
                            onPress={() => handleSelect(null)}
                            className={`flex-row items-center justify-between py-4 border-b border-gray-100`}
                        >
                            <View className="flex-row items-center">
                                <LayoutGrid color="#374151" size={24} className="mr-3" />
                                <Text className={`text-[17px] text-gray-800`}>
                                    Todas las categorías
                                </Text>
                            </View>
                            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: !selectedCategory ? '#1f2937' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                {!selectedCategory && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1f2937' }} />}
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* List */}
                    {activeList.map((item: any, index: number) => {
                        const isSelected = selectedCategory === item.id;
                        const isLast = index === activeList.length - 1;

                        const isFirstHorse = item.id === 'sillas-de-montar-y-accesorios' && !item.isSub;
                        const isFirstRider = item.id === 'calzado-ecuestre' && !item.isSub;

                        return (
                            <React.Fragment key={item.id}>
                                {IS_EQUIPOP && isFirstHorse && (
                                    <View className="bg-primary-muted py-2 px-4 -mx-2 rounded-lg mb-2 mt-2">
                                        <Text className="text-primary font-bold text-[13px]">PARA CABALLOS</Text>
                                    </View>
                                )}
                                {IS_EQUIPOP && isFirstRider && (
                                    <View className="bg-primary-muted py-2 px-4 -mx-2 rounded-lg mb-2 mt-4">
                                        <Text className="text-primary font-bold text-[13px]">PARA RIDERS</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        if (!item.isSub && item.hasSub) {
                                            setActiveParentId(item.id);
                                        } else {
                                            handleSelect(item.id);
                                        }
                                    }}
                                    className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
                                >
                                <View className="flex-row items-center">
                                    <Text className={`text-[17px] text-gray-800`}>
                                        {item.label}
                                    </Text>
                                </View>

                                {item.hasSub && !item.isSub ? (
                                    <ChevronRight color="#9ca3af" size={20} />
                                ) : (
                                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? '#1f2937' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1f2937' }} />}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </React.Fragment>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
