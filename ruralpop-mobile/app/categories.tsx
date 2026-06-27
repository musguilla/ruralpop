import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EQUIPOP_CATEGORIES = [
    { id: 'sillas-de-montar-y-accesorios', type: 'category', label: 'Sillas de montar' },
    { id: 'mantillas-y-salvacruces', type: 'category', label: 'Mantillas' },
    { id: 'cabezadas-y-riendas', type: 'category', label: 'Cabezadas' },
    { id: 'bocados-y-filetes', type: 'category', label: 'Bocados' },
    { id: 'mantas', type: 'category', label: 'Mantas' },
    { id: 'ropa-ecuestre-mujer', type: 'category', label: 'Ropa Mujer' },
    { id: 'ropa-ecuestre-hombre', type: 'category', label: 'Ropa Hombre' },
    { id: 'ropa-ecuestre-infantil', type: 'category', label: 'Ropa Infantil' },
    { id: 'cuidado-e-higiene-del-caballo', type: 'category', label: 'Higiene' },
    { id: 'herrado-y-cascos', type: 'category', label: 'Herrado' },
    { id: 'alimentacin-y-suplementos', type: 'category', label: 'Alimentación' },
    { id: 'transporte-y-viaje', type: 'category', label: 'Transporte' },
];

export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleCategoryPress = (category: any) => {
        router.push({ pathname: '/(tabs)/search', params: { category: category.id } });
    };

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 48 }}>
            <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800">Buscar por categoría</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {EQUIPOP_CATEGORIES.map((category, index) => (
                    <TouchableOpacity
                        key={category.id}
                        onPress={() => handleCategoryPress(category)}
                        className={`flex-row items-center px-4 py-4 ${index !== EQUIPOP_CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                        <View className="w-16 h-16 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                            {/* Empty placeholder for future image upload */}
                            {/* When images are uploaded, we can add: <Image source={...} className="w-full h-full" contentFit="cover" /> */}
                        </View>
                        <Text className="flex-1 text-lg text-slate-700">{category.label}</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
