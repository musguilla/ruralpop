import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IS_EQUIPOP } from '../src/config/tenants';

const CABALLOS_CATEGORIES = [
    { id: 'sillas-de-montar-y-accesorios', type: 'category', label: 'Sillas de montar y accesorios', image: require('../assets/equipop/categories/sillas-de-montar-y-accesorios.jpg') },
    { id: 'mantillas-y-salvacruces', type: 'category', label: 'Mantillas y salvacruces', image: require('../assets/equipop/categories/mantillas-y-salvacruces.jpg') },
    { id: 'cabezadas-y-riendas', type: 'category', label: 'Cabezadas y riendas', image: require('../assets/equipop/categories/cabezadas-y-riendas.jpg') },
    { id: 'bocados-y-filetes', type: 'category', label: 'Bocados y filetes', image: require('../assets/equipop/categories/bocados-y-filetes.jpg') },
    { id: 'protectores-y-vendas', type: 'category', label: 'Protectores y vendas', image: require('../assets/equipop/categories/protectores-y-vendas.jpg') },
    { id: 'mantas', type: 'category', label: 'Mantas', image: require('../assets/equipop/categories/mantas.jpg') },
    { id: 'cuidado-e-higiene-del-caballo', type: 'category', label: 'Cuidado e higiene', image: require('../assets/equipop/categories/cuidado-e-higiene-del-caballo.jpg') },
    { id: 'establo-y-cuadra', type: 'category', label: 'Establo', image: require('../assets/equipop/categories/establo-y-cuadra.jpg') },
];

const JINETES_CATEGORIES = [
    { id: 'calzado-ecuestre', type: 'category', label: 'Calzado ecuestre', image: require('../assets/equipop/categories/calzado-ecuestre.jpg') },
    { id: 'ropa-ecuestre-mujer', type: 'category', label: 'Ropa ecuestre mujer', image: require('../assets/equipop/categories/ropa-ecuestre-mujer.jpg') },
    { id: 'ropa-ecuestre-hombre', type: 'category', label: 'Ropa ecuestre hombre', image: require('../assets/equipop/categories/ropa-ecuestre-hombre.jpg') },
    { id: 'ropa-ecuestre-infantil', type: 'category', label: 'Ropa ecuestre infantil', image: require('../assets/equipop/categories/ropa-ecuestre-ninos.jpg') },
    { id: 'fustas-espuelas-y-ayudas', type: 'category', label: 'Fustas, espuelas y ayudas', image: require('../assets/equipop/categories/fustas-espuelas-y-ayudas.jpg') },
];

const RURALPOP_CATEGORIES_LIST = [
    { id: 'Bovino', label: 'Bovino', image: require('../assets/ruralpop/categories/bovino.jpg') },
    { id: 'Equino', label: 'Equino', image: require('../assets/ruralpop/categories/equino.jpg') },
    { id: 'Caprino', label: 'Caprino', image: require('../assets/ruralpop/categories/caprino.jpg') },
    { id: 'Ovino', label: 'Ovino', image: require('../assets/ruralpop/categories/ovino.jpg') },
    { id: 'Porcino', label: 'Porcino', image: require('../assets/ruralpop/categories/porcino.jpg') },
    { id: 'Avicultura', label: 'Avicultura', image: require('../assets/ruralpop/categories/avicultura.jpg') },
    { id: 'Apicultura', label: 'Apicultura', image: require('../assets/ruralpop/categories/apicultura.jpg') },
    { id: 'Conejos', label: 'Conejos', image: require('../assets/ruralpop/categories/conejos.jpg') },
    { id: 'maquinaria', label: 'Maquinaria', image: require('../assets/ruralpop/categories/maquinaria.jpg') },
    { id: 'recambios-maquinaria', label: 'Recambios maquinaria', image: require('../assets/icon-tractor.png') },
    { id: 'equipamiento-y-material', label: 'Equipamiento y material', image: require('../assets/icon-tractor.png') },
    { id: 'agricultura', label: 'Agricultura', image: require('../assets/ruralpop/categories/agricultura.jpg') },
    { id: 'forraje', label: 'Forraje', image: require('../assets/ruralpop/categories/forraje.jpg') },
    { id: 'fincas', label: 'Fincas', image: require('../assets/icon-fincas.webp') },
    { id: 'alimentos', label: 'Alimentos Km0', image: require('../assets/ruralpop/categories/alimentoskm0.jpeg') },
    { id: 'coches', label: 'Coches', image: require('../assets/ruralpop/categories/coches.jpg') },
    { id: 'atv', label: 'ATV', image: require('../assets/ruralpop/categories/atv.jpg') },
    { id: 'motos', label: 'Motos', image: require('../assets/ruralpop/categories/motos.jpg') },
    { id: 'servicios', label: 'Servicios', image: require('../assets/ruralpop/categories/servicios.jpg') },
    { id: 'Transporte', label: 'Transporte', image: require('../assets/ruralpop/categories/transporte.jpg') },
    { id: 'genetica-y-reproduccion', label: 'Genética y reproducción', image: require('../assets/ruralpop/categories/genetica.jpg') },
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
                {IS_EQUIPOP ? (
                    <>
                        {/* Header Para Caballos */}
                        <View className="bg-blue-50 py-3 px-4 border-b border-blue-100">
                            <Text className="text-blue-900 font-bold text-sm tracking-wider">PARA CABALLOS</Text>
                        </View>

                        {CABALLOS_CATEGORIES.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => handleCategoryPress(category)}
                                className={`flex-row items-center px-4 py-4 ${index !== CABALLOS_CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <View className="w-16 h-16 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                                    <Image source={category.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                </View>
                                <Text className="flex-1 text-lg text-slate-700">{category.label}</Text>
                                <ChevronRight color="#cbd5e1" size={20} />
                            </TouchableOpacity>
                        ))}

                        {/* Header Para Riders */}
                        <View className="bg-blue-50 py-3 px-5 border-y border-blue-100 mt-2 mb-2">
                            <Text className="text-blue-900 font-bold text-sm tracking-wider">PARA RIDERS</Text>
                        </View>

                        {JINETES_CATEGORIES.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => handleCategoryPress(category)}
                                className={`flex-row items-center px-4 py-4 ${index !== JINETES_CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <View className="w-16 h-16 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                                    <Image source={category.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                </View>
                                <Text className="flex-1 text-lg text-slate-700">{category.label}</Text>
                                <ChevronRight color="#cbd5e1" size={20} />
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <>
                        {RURALPOP_CATEGORIES_LIST.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => handleCategoryPress(category)}
                                className={`flex-row items-center px-4 py-4 ${index !== RURALPOP_CATEGORIES_LIST.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <View className="w-16 h-16 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                                    <Image source={category.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                </View>
                                <Text className="flex-1 text-lg text-slate-700">{category.label}</Text>
                                <ChevronRight color="#cbd5e1" size={20} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
