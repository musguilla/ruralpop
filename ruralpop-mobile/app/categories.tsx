import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EQUIPOP_CATEGORIES = [
    { id: 'sillas-de-montar-y-accesorios', type: 'category', label: 'Sillas de montar', image: require('../assets/equipop/categories/sillas-de-montar-y-accesorios.jpg') },
    { id: 'mantillas-y-salvacruces', type: 'category', label: 'Mantillas y salvacruces', image: require('../assets/equipop/categories/mantillas-y-salvacruces.jpg') },
    { id: 'cabezadas-y-riendas', type: 'category', label: 'Cabezadas y riendas', image: require('../assets/equipop/categories/cabezadas-y-riendas.jpg') },
    { id: 'bocados-y-filetes', type: 'category', label: 'Bocados y filetes', image: require('../assets/equipop/categories/bocados-y-filetes.jpg') },
    { id: 'protectores-y-vendas', type: 'category', label: 'Protectores y vendas', image: require('../assets/equipop/categories/protectores-y-vendas.jpg') },
    { id: 'mantas', type: 'category', label: 'Mantas', image: require('../assets/equipop/categories/mantas.jpg') },
    { id: 'cuidado-e-higiene-del-caballo', type: 'category', label: 'Cuidado e higiene', image: require('../assets/equipop/categories/cuidado-e-higiene-del-caballo.jpg') },
    { id: 'establo-y-cuadra', type: 'category', label: 'Establo y cuadra', image: require('../assets/equipop/categories/establo-y-cuadra.jpg') },
    { id: 'calzado-ecuestre', type: 'category', label: 'Calzado ecuestre', image: require('../assets/equipop/categories/calzado-ecuestre.jpg') },
    { id: 'ropa-ecuestre-mujer', type: 'category', label: 'Ropa ecuestre mujer', image: require('../assets/equipop/categories/ropa-ecuestre-mujer.jpg') },
    { id: 'ropa-ecuestre-hombre', type: 'category', label: 'Ropa ecuestre hombre', image: require('../assets/equipop/categories/ropa-ecuestre-hombre.jpg') },
    { id: 'ropa-ecuestre-infantil', type: 'category', label: 'Ropa ecuestre infantil', image: require('../assets/equipop/categories/ropa-ecuestre-ninos.jpg') },
    { id: 'fustas-espuelas-y-ayudas', type: 'category', label: 'Fustas, espuelas y ayudas', image: require('../assets/equipop/categories/fustas-espuelas-y-ayudas.jpg') },
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
                            <Image source={category.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        </View>
                        <Text className="flex-1 text-lg text-slate-700">{category.label}</Text>
                        <ChevronRight color="#cbd5e1" size={20} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
