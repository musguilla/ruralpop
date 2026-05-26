import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';

export default function EditShippingAddressScreen() {
    const { user, session } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();
    const isFromCheckout = params.returnToCheckout === 'true';
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (!user || !session) return;
        const fetchAddress = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const currentAddress = currentUser?.user_metadata?.shipping_address;
            if (currentAddress) {
                setFullName(currentAddress.fullName || '');
                setAddress(currentAddress.address || '');
                setCity(currentAddress.city || '');
                setPostalCode(currentAddress.postalCode || '');
                setExtraInfo(currentAddress.extraInfo || '');
                setPhone(currentAddress.phone || '');
            } else {
                setFullName(currentUser?.user_metadata?.name || currentUser?.user_metadata?.full_name || '');
            }
        };
        fetchAddress();
    }, [user, session]);

    const handleSave = async () => {
        if (!fullName || !address || !city || !postalCode || !phone) {
            Alert.alert("Campos obligatorios", "Por favor rellena todos los campos excepto la información adicional.");
            return;
        }

        setLoading(true);
        try {
            const newAddress = {
                fullName: fullName.trim(),
                address: address.trim(),
                city: city.trim(),
                postalCode: postalCode.trim(),
                extraInfo: extraInfo.trim(),
                phone: phone.trim()
            };

            const { error } = await supabase.auth.updateUser({
                data: { shipping_address: newAddress }
            });

            if (error) throw error;
            
            if (isFromCheckout) {
                Alert.alert("Dirección guardada", "Ya puedes continuar con la compra.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                router.back();
            }
        } catch (error: any) {
            Alert.alert("Error", "No se pudo guardar la dirección. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <View className="flex-1 items-center pr-6">
                    <Text className="text-[17px] font-bold text-gray-900">{isFromCheckout ? 'Dirección de envío' : 'Edita tu dirección'}</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
                    <View className="space-y-1">
                        {/* Country Fixed to ES */}
                        <View className="border-b border-gray-100 py-4 flex-row justify-between items-center">
                            <Text className="text-[16px] text-gray-800">ES</Text>
                            <ChevronDown color="#9ca3af" size={20} />
                        </View>

                        <View className="border-b border-gray-100 py-1">
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nombre completo"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                                autoCapitalize="words"
                            />
                        </View>

                        <View className="border-b border-gray-100 py-1">
                            <TextInput
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Dirección"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                            />
                        </View>

                        <View className="border-b border-gray-100 py-1">
                            <TextInput
                                value={city}
                                onChangeText={setCity}
                                placeholder="Localidad"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                            />
                        </View>

                        <View className="border-b border-gray-100 py-1">
                            <TextInput
                                value={postalCode}
                                onChangeText={setPostalCode}
                                placeholder="Código Postal"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                                keyboardType="number-pad"
                                maxLength={5}
                            />
                        </View>

                        <View className="border-b border-gray-100 py-1">
                            <TextInput
                                value={extraInfo}
                                onChangeText={setExtraInfo}
                                placeholder="Información adicional (Opcional)"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                            />
                        </View>

                        <View className="border-b border-gray-100 py-1 mb-6">
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Teléfono"
                                placeholderTextColor="#9ca3af"
                                className="w-full text-[16px] text-gray-900 py-3"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <Text className="text-[14px] text-gray-500 leading-5">
                        Compartiremos tus datos con la empresa de transporte para gestionar tus envíos. Para saber más, consulta las <Text className="text-[#059669] underline">Condiciones de uso</Text> y la <Text className="text-[#059669] underline">Política de privacidad</Text> de Ruralpop.
                    </Text>

                    <View className="h-24" />
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className={`w-full py-4 rounded-full items-center shadow-sm ${loading ? 'bg-[#059669]/70' : 'bg-[#059669]'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-[17px]">Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
