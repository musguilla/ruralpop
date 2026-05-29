import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Sparkles, Crown, CheckCircle2 } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../lib/supabase';

interface FeaturedCheckoutMobileProps {
    listingId: string;
    onSkip: () => void;
}

const STRIPE_PLANS = [
    {
        id: "bump",
        name: "Subir arriba",
        description: "Tu anuncio volverá a la primera posición de los resultados de búsqueda más recientes.",
        price: 1.49,
        icon: Sparkles,
        color: "#3b82f6", // blue
        bg: "bg-blue-50",
        border: "border-blue-200",
        badge: null
    },
    {
        id: "highlight_7",
        name: "Destacar 7 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 7 días en su categoría.",
        price: 2.99,
        icon: Sparkles,
        color: "#059669", // green
        bg: "bg-green-50",
        border: "border-green-200",
        badge: "El más vendido"
    },
    {
        id: "highlight_20",
        name: "Destacar 20 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 20 días en su categoría.",
        price: 4.99,
        icon: Crown,
        color: "#d97706", // amber
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: null
    }
];

export function FeaturedCheckoutMobile({ listingId, onSkip }: FeaturedCheckoutMobileProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const handleProceedToPayment = async () => {
        if (!selectedPlanId) return;

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
                    planId: selectedPlanId 
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
            Alert.alert(
                "¡Anuncio Destacado!", 
                "El pago se ha realizado correctamente. Tu anuncio está ahora destacado.",
                [{ text: "OK", onPress: onSkip }]
            );

        } catch (error: any) {
            console.error("Error en pago de destacado:", error);
            Alert.alert("Error", error.message || "Ha ocurrido un error al conectar con el procesador de pagos.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View className="flex-1 bg-surface pt-16 px-6">
            <View className="items-center mb-8 mt-4">
                <View className="bg-green-100 p-4 rounded-full mb-4 mt-2">
                    <CheckCircle2 color="#059669" size={48} />
                </View>
                <Text className="text-3xl font-black text-text mb-2 text-center">¡Anuncio subido!</Text>
                <Text className="text-text-muted text-center text-base">
                    Multiplica tus ventas destacando tu anuncio por encima de los demás.
                </Text>
            </View>

            <Text className="text-lg font-bold text-text mb-4">Elige un plan opcional:</Text>

            <View className="space-y-5 mb-8">
                {STRIPE_PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlanId === plan.id;
                    
                    return (
                        <TouchableOpacity
                            key={plan.id}
                            onPress={() => setSelectedPlanId(plan.id)}
                            activeOpacity={0.8}
                            className={`p-5 rounded-2xl border-2 flex-row items-center relative overflow-hidden ${isSelected ? `border-[${plan.color}] ${plan.bg}` : 'border-gray-200 bg-white'}`}
                        >
                            {plan.badge && (
                                <View className="absolute top-0 right-0 bg-[#059669] px-3 py-1 rounded-bl-xl z-10">
                                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">{plan.badge}</Text>
                                </View>
                            )}
                            
                            <View className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                                <Icon color={isSelected ? plan.color : "#9ca3af"} size={24} />
                            </View>
                            
                            <View className="flex-1">
                                <Text className={`text-lg font-bold mb-1 ${isSelected ? 'text-text' : 'text-text-muted'}`}>{plan.name}</Text>
                                <Text className="text-xs text-text-muted leading-tight">{plan.description}</Text>
                            </View>
                            
                            <View className="ml-3 items-end justify-center">
                                <Text className={`text-xl font-black ${isSelected ? `text-[${plan.color}]` : 'text-gray-400'}`}>
                                    {plan.price.toString().replace('.', ',')}€
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {selectedPlanId ? (
                <TouchableOpacity
                    onPress={handleProceedToPayment}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-full flex-row justify-center items-center mb-4 ${isProcessing ? 'bg-primary/70' : 'bg-primary shadow-sm'}`}
                >
                    {isProcessing && <ActivityIndicator color="white" className="mr-2" />}
                    <Text className="text-white font-black text-lg">Continuar al pago</Text>
                </TouchableOpacity>
            ) : null}

            <TouchableOpacity
                onPress={onSkip}
                disabled={isProcessing}
                className="w-full py-4 rounded-full flex items-center justify-center mb-8 bg-gray-100"
            >
                <Text className="text-gray-500 font-bold text-lg">No, gracias. Volver al inicio</Text>
            </TouchableOpacity>
        </View>
    );
}
