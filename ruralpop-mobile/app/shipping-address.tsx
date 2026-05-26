import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react-native';

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    extraInfo: string;
    phone: string;
}

export default function ShippingAddressScreen() {
    const { user, session } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<ShippingAddress | null>(null);

    const fetchAddress = async () => {
        if (!user || !session) return;
        setLoading(true);
        try {
            // Using user metadata to store shipping address
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser?.user_metadata?.shipping_address) {
                setAddress(currentUser.user_metadata.shipping_address);
            } else {
                setAddress(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddress();
    }, [user, session]);

    const handleDelete = () => {
        Alert.alert(
            "Eliminar dirección",
            "¿Estás seguro de que quieres eliminar esta dirección?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase.auth.updateUser({
                                data: { shipping_address: null }
                            });
                            if (error) throw error;
                            setAddress(null);
                        } catch (error: any) {
                            Alert.alert("Error", "No se pudo eliminar la dirección");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <View className="flex-1 items-center pr-6">
                    <Text className="text-xl font-bold text-text">Dirección de envío</Text>
                </View>
            </View>

            <ScrollView className="flex-1 bg-white">
                {loading ? (
                    <View className="py-20 justify-center items-center">
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : address ? (
                    <View className="px-6 py-6 border-b border-gray-100">
                        <Text className="text-[17px] font-bold text-gray-900 mb-1">{address.fullName}</Text>
                        <Text className="text-[15px] text-gray-500 mb-1">{address.address}</Text>
                        <Text className="text-[15px] text-gray-500 mb-1">{address.city}</Text>
                        <Text className="text-[15px] text-gray-500 mb-6">{address.postalCode} {address.extraInfo ? `${address.extraInfo}, ` : ''}ES</Text>

                        <View className="flex-row justify-between w-full">
                            <TouchableOpacity 
                                className="flex-1 items-center" 
                                onPress={() => router.push('/edit-shipping-address')}
                            >
                                <Text className="text-[16px] text-[#059669]">Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="flex-1 items-center" 
                                onPress={handleDelete}
                            >
                                <Text className="text-[16px] text-red-400">Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="px-6 py-10 items-center">
                        <Text className="text-[16px] text-gray-500 mb-6 text-center">
                            Aún no tienes ninguna dirección de envío guardada.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/edit-shipping-address')}
                            className="bg-[#059669] px-6 py-3 rounded-full shadow-sm"
                        >
                            <Text className="text-white font-bold text-[16px]">Añadir dirección</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
