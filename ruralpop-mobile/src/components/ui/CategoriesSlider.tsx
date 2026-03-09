import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Tractor, Leaf, Apple, Hammer, PiggyBank, Bird, Dog, Rabbit, Briefcase, Truck, Stethoscope, Anvil } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const VISUAL_CATEGORIES = [
    { id: 'Bovino', type: 'subcategory', label: 'Bovino', image: require('../../../assets/icon-bovino.png') },
    { id: 'Equino', type: 'subcategory', label: 'Equino', image: require('../../../assets/icon-equino.png') },
    { id: 'Caprino', type: 'subcategory', label: 'Caprino', image: require('../../../assets/icon-caprino.png') },
    { id: 'Ovino', type: 'subcategory', label: 'Ovino', image: require('../../../assets/icon-ovino.png') },
    { id: 'Porcino', type: 'subcategory', label: 'Porcino', image: require('../../../assets/icon-porcino.png') },
    { id: 'Avicultura', type: 'subcategory', label: 'Avicultura', image: require('../../../assets/icon-aves.png') },
    { id: 'Perros', type: 'subcategory', label: 'Perros', image: require('../../../assets/icon-perro.png') },
    { id: 'Conejos', type: 'subcategory', label: 'Conejos', image: require('../../../assets/icon-conejos.png') },
    { id: 'maquinaria', type: 'category', label: 'Maquinaria', image: require('../../../assets/icon-tractor.png') },
    { id: 'forraje', type: 'category', label: 'Forraje', image: require('../../../assets/icon-forraje.png') },
    { id: 'alimentos', type: 'category', label: 'Km0', image: require('../../../assets/icon-alimentos.png') },
    { id: 'Transporte', type: 'subcategory', label: 'Transporte', image: require('../../../assets/icon-transportes.png') },
    { id: 'Veterinarios', type: 'subcategory', label: 'Veterinarios', image: require('../../../assets/icon-veterinarios.png') },
    { id: 'Herradores', type: 'subcategory', label: 'Herradores', image: require('../../../assets/icon-herradores.png') },
];

export function CategoriesSlider() {
    const router = useRouter();

    return (
        <View className="w-full mt-6 mb-8">
            <View className="px-4 mb-4">
                <Text className="text-xl font-bold text-text">Todas las categorías</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
                {VISUAL_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => router.push({ pathname: '/(tabs)/search', params: { category: cat.id } })}
                        className="items-center justify-center bg-white border border-gray-200 rounded-2xl p-4 w-28 h-28 shadow-sm"
                    >
                        {cat.image ? (
                            <Image source={cat.image} className="w-10 h-10" contentFit="contain" />
                        ) : (() => {
                            const IconComponent = (cat as any).Icon;
                            return IconComponent ? <IconComponent color="#059669" size={32} /> : null;
                        })()}
                        <Text className="text-sm font-bold text-text mt-3 text-center">{cat.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
