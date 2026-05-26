import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ShieldCheck, X } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

interface AnimalWelfareModalProps {
    visible: boolean;
    onClose: () => void;
    listingId: string;
    onSuccess: () => void;
}

export function AnimalWelfareModal({ visible, onClose, listingId, onSuccess }: AnimalWelfareModalProps) {
    const [step, setStep] = useState<'info' | 'form' | 'payment'>('info');
    
    // Form fields
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nif, setNif] = useState('');
    const [phone, setPhone] = useState('');
    const [zooRegister, setZooRegister] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const handleProceedToPayment = async () => {
        if (!name || !nif || !phone || !zooRegister) {
            Alert.alert("Datos incompletos", "Por favor, rellena todos los campos obligatorios.");
            return;
        }

        setIsProcessing(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No estás autenticado.");

            const siteUrl = __DEV__ && process.env.EXPO_PUBLIC_SITE_URL ? process.env.EXPO_PUBLIC_SITE_URL : 'https://www.ruralpop.com';

            const res = await fetch(`${siteUrl}/api/create-payment-intent`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ 
                    listingId, 
                    planId: "animal_welfare_validation",
                    welfareDetails: {
                        name,
                        lastName,
                        nif,
                        phone,
                        zoo_register_number: zooRegister
                    }
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error creando el pago");
            }

            const { clientSecret } = await res.json();

            // Initialize Stripe Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Ruralpop',
                paymentIntentClientSecret: clientSecret,
                allowsDelayedPaymentMethods: false,
                defaultBillingDetails: {
                    name: `${name} ${lastName}`.trim(),
                    phone,
                }
            });

            if (initError) {
                throw new Error(initError.message);
            }

            // Present Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    // Usuario canceló el pago, puede volver a intentarlo
                    return;
                }
                throw new Error(paymentError.message);
            }

            // Pago exitoso
            Alert.alert("¡Pago completado!", "Tu anuncio ha sido validado con éxito.");
            onSuccess();

        } catch (error: any) {
            console.error("Error en pago Animal Welfare:", error);
            Alert.alert("Error", error.message || "Ha ocurrido un error al conectar con el procesador de pagos.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal 
            visible={visible} 
            transparent={true} 
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end bg-black/60"
            >
                <View className="bg-white rounded-t-3xl w-full max-h-[90%] p-6 relative shadow-xl">
                    <TouchableOpacity 
                        onPress={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
                    >
                        <X color="#9ca3af" size={24} />
                    </TouchableOpacity>

                    {step === 'info' && (
                        <View className="space-y-4 pt-4">
                            <View className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-2 mx-auto">
                                <ShieldCheck color="#059669" size={32} />
                            </View>
                            
                            <Text className="text-2xl font-black text-text text-center mb-4">
                                Anuncios para profesionales
                            </Text>
                            
                            <Text className="text-sm text-text-muted text-center mb-2">
                                La Ley de Bienestar Animal en España limita la publicación de anuncios de determinados animales de compañía por parte de usuarios particulares en plataformas online.
                            </Text>
                            <Text className="text-sm text-text-muted text-center mb-4">
                                Para publicar este tipo de anuncios, es necesario disponer de un perfil profesional verificado donde debes introducir número de registro de núcleo zoológico, explotación o criadero.
                            </Text>
                            <Text className="text-sm text-text font-semibold text-center mb-6">
                                En Ruralpop puedes hacerlo de forma sencilla activando un Anuncio Pro por solo 1,99€
                            </Text>

                            <TouchableOpacity
                                onPress={() => setStep('form')}
                                className="w-full py-4 bg-primary rounded-2xl flex items-center shadow-sm"
                            >
                                <Text className="text-white font-black text-lg">Activar Anuncio Pro · 1,99€</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'form' && (
                        <ScrollView showsVerticalScrollIndicator={false} className="pt-2">
                            <Text className="text-xl font-bold text-text mb-2">
                                Datos del Profesional / Criador
                            </Text>
                            <Text className="text-sm text-text-muted mb-6">
                                Completa tus datos fiscales para poder validar el anuncio. Esta información se guardará en tu perfil.
                            </Text>

                            <View className="space-y-4 mb-6">
                                <View className="mb-4">
                                    <Text className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</Text>
                                    <TextInput 
                                        value={name} 
                                        onChangeText={setName}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text"
                                        placeholder="Ej: Juan"
                                    />
                                </View>
                                
                                <View className="mb-4">
                                    <Text className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Apellidos</Text>
                                    <TextInput 
                                        value={lastName} 
                                        onChangeText={setLastName}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text"
                                        placeholder="Ej: Pérez"
                                    />
                                </View>
                                
                                <View className="mb-4">
                                    <Text className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">NIF / CIF</Text>
                                    <TextInput 
                                        value={nif} 
                                        onChangeText={setNif}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text"
                                        placeholder="Ej: 12345678A"
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono de Contacto</Text>
                                    <TextInput 
                                        value={phone} 
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-text"
                                        placeholder="Ej: 600 000 000"
                                    />
                                </View>

                                <View className="mb-6">
                                    <Text className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                                        Nº Reg. Núcleo Zoológico / Explotación / Criadero
                                    </Text>
                                    <TextInput 
                                        value={zooRegister} 
                                        onChangeText={setZooRegister}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-text"
                                        placeholder="Ej: ES123456789"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleProceedToPayment}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-2xl flex-row justify-center items-center mb-3 ${isProcessing ? 'bg-primary/70' : 'bg-primary shadow-sm'}`}
                            >
                                {isProcessing && <ActivityIndicator color="white" className="mr-2" />}
                                <Text className="text-white font-black text-lg">Continuar al pago (1,99€)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setStep('info')}
                                disabled={isProcessing}
                                className="w-full py-4 bg-gray-100 rounded-2xl flex items-center mb-8"
                            >
                                <Text className="text-gray-500 font-bold text-lg">Volver</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se reutiliza el endpoint web /api/create-payment-intent pasando el Bearer token de Supabase.
 * - Usamos KeyboardAvoidingView para que el formulario no quede tapado por el teclado en iOS/Android.
 * - Modal adaptado a la estética mobile, usando padding bottom para SafeArea y diseño slide up.
 */
