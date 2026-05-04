import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { X, Check, ChevronRight, ChevronLeft, Search, List, PawPrint, Tractor, Leaf, Briefcase, Apple } from 'lucide-react-native';
import { Image } from 'expo-image';
import { CATEGORIES } from '../../../constants/categories';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeParentId, setActiveParentId] = useState<string | null>(null);

    const activeParent = useMemo(() => CATEGORIES.find(c => c.id === activeParentId), [activeParentId]);

    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const activeList = useMemo(() => {
        const query = normalizeStr(searchQuery);
        if (activeParent) {
            const subs = activeParent.subcategories
                .filter((sub: string) => normalizeStr(sub).includes(query))
                .map((sub: string) => ({ id: sub, label: sub, isSub: true }));

            if (!query || normalizeStr(`Todo en ${activeParent.label}`).includes(query)) {
                return [{ id: activeParent.id, label: `Todo en ${activeParent.label}`, isSub: true, isAllOption: true }, ...subs];
            }
            return subs;
        }
        return CATEGORIES
            .filter((c: any) => normalizeStr(c.label).includes(query))
            .map((c: any) => ({
                id: c.id,
                label: c.label,
                hasSub: c.subcategories && c.subcategories.length > 0,
                isSub: false
            }));
    }, [activeParent, searchQuery]);

    const handleSelect = (id: string | null) => {
        onSelect(id);
        onClose();
        // Reset state after close
        setTimeout(() => {
            setSearchQuery('');
            setActiveParentId(null);
        }, 300);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSearchQuery('');
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

                {/* Search Bar */}
                <View className="px-6 pt-4 pb-6 border-b border-gray-100">
                    <View className="flex-row items-center bg-white border border-gray-300 focus:border-primary rounded-xl h-12 px-4">
                        <Search color="#10b981" size={20} />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-800"
                            style={{ paddingVertical: 0 }}
                            placeholder={activeParent ? `Buscar en ${activeParent.label}` : "Buscar una categoría"}
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                    {/* Todas las categorías - only show in root level and if no search query (or matches query) */}
                    {!activeParent && (!searchQuery || "todas las categorias".includes(searchQuery.toLowerCase())) && (
                        <TouchableOpacity
                            onPress={() => handleSelect(null)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border mb-6 ${!selectedCategory ? 'bg-primary-muted/20 border-primary' : 'bg-white border-gray-200'}`}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${!selectedCategory ? 'bg-primary-muted/50' : 'bg-gray-100'}`}>
                                    <List color={!selectedCategory ? "#059669" : "#6b7280"} size={22} />
                                </View>
                                <Text className={`text-base font-bold ${!selectedCategory ? 'text-primary' : 'text-text'}`}>
                                    Todas las categorías
                                </Text>
                            </View>
                            {!selectedCategory && <Check color="#059669" size={24} />}
                        </TouchableOpacity>
                    )}

                    {/* List */}
                    {activeList.map((item: any, index: number) => {
                        const isSelected = selectedCategory === item.id;
                        const IconComponent = !item.isSub ? ICONS[item.id] || List : null;
                        const isLast = index === activeList.length - 1;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    if (!item.isSub && item.hasSub) {
                                        setActiveParentId(item.id);
                                        setSearchQuery('');
                                    } else {
                                        handleSelect(item.id);
                                    }
                                }}
                                className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    {!item.isSub && (
                                        <View className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 items-center justify-center mr-4">
                                            {IconComponent && <IconComponent color="#059669" size={20} />}
                                        </View>
                                    )}
                                    <Text className={`text-[17px] ${isSelected ? 'font-bold text-primary' : 'text-gray-800'}`}>
                                        {item.label}
                                    </Text>
                                </View>

                                {item.hasSub && !item.isSub && (
                                    <ChevronRight color="#9ca3af" size={20} />
                                )}

                                {isSelected && (!item.hasSub || item.isSub) && (
                                    <Check color="#059669" size={24} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
