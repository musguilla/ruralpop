import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { ShieldAlert, X } from 'lucide-react-native';

interface DogLawModalProps {
    visible: boolean;
    onClose: () => void;
}

export function DogLawModal({ visible, onClose }: DogLawModalProps) {
    const handleProRedirect = () => {
        Linking.openURL('https://www.ruralpop.com/empresas-profesionales-sector-rural');
        onClose();
    };

    if (!visible) return null;

    return (
        <View 
            style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]} 
            className="flex-1 justify-center items-center bg-black/60 px-4"
        >
            <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                    <TouchableOpacity 
                        onPress={onClose}
                        className="absolute top-4 right-4 z-10"
                    >
                        <X color="#9ca3af" size={24} />
                    </TouchableOpacity>

                    <View className="items-center mb-4 mt-2">
                        <View className="bg-red-100 p-4 rounded-full mb-4">
                            <ShieldAlert color="#ef4444" size={32} />
                        </View>
                        <Text className="text-xl font-bold text-text text-center">
                            Categoría Restringida
                        </Text>
                    </View>

                    <Text className="text-text-muted text-center mb-4 leading-relaxed">
                        La Ley de Bienestar Animal (Ley 7/2023) en España, vigente desde el 29 de septiembre de 2023, prohíbe terminantemente la venta directa de animales de compañía (perros, gatos, hurones, roedores, pájaros) a través de Internet, portales web o aplicaciones por usuarios no profesionales.
                    </Text>

                    <Text className="text-text-muted text-center font-bold mb-6">
                        Si eres un profesional con número de registro de núcleo zoológico puedes crear un plan Ruralpop Plan Pro.
                    </Text>

                    <View className="space-y-3 flex-col gap-3">
                        <TouchableOpacity
                            onPress={handleProRedirect}
                            className="bg-primary py-3 px-4 rounded-xl w-full items-center"
                        >
                            <Text className="text-white font-bold text-base">Ruralpop Plan Pro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-100 py-3 px-4 rounded-xl w-full items-center"
                        >
                            <Text className="text-text font-bold text-base">Elegir otra categoría</Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>
    );
}
