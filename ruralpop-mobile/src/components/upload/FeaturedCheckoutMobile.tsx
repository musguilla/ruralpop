import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Crown, CheckCircle2 } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../lib/supabase';
import { IS_EQUIPOP } from '../../config/tenants';

// ============================================================================
// 1. Interfaces
// ============================================================================

export interface StripePlan {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: typeof Sparkles;
    color: string;
    bgColor: string;
    borderColor: string;
    badge: string | null;
}

interface FeaturedCheckoutMobileProps {
    listingId: string;
    onSkip: () => void;
    isFromVentas?: boolean;
}

const STRIPE_PLANS: StripePlan[] = [
    {
        id: "bump",
        name: "Subir arriba",
        description: "Tu anuncio volverá a la primera posición de los resultados de búsqueda más recientes.",
        price: 1.49,
        icon: Sparkles,
        color: "#2563eb", // blue-600
        bgColor: "#eff6ff", // blue-50
        borderColor: "#93c5fd", // blue-300
        badge: null
    },
    {
        id: "highlight_7",
        name: "Destacar 7 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 7 días en su categoría.",
        price: 2.99,
        icon: Sparkles,
        color: "#059669", // emerald-600
        bgColor: "#f0fdf4", // emerald-50
        borderColor: "#86efac", // emerald-300
        badge: "El más vendido"
    },
    {
        id: "highlight_20",
        name: "Destacar 20 días",
        description: "Tu anuncio aparecerá en primeras posiciones durante los próximos 20 días en su categoría.",
        price: 4.99,
        icon: Crown,
        color: "#d97706", // amber-600
        bgColor: "#fffbeb", // amber-50
        borderColor: "#fde68a", // amber-200
        badge: null
    }
];

// ============================================================================
// 2. Component Logic & Implementation
// ============================================================================

export function FeaturedCheckoutMobile({
    listingId,
    onSkip,
    isFromVentas = false
}: FeaturedCheckoutMobileProps) {
    const insets = useSafeAreaInsets();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const selectedPlan = STRIPE_PLANS.find(p => p.id === selectedPlanId) || null;

    /**
     * Permite activar o desactivar un plan pulsando sobre el card (toggle)
     */
    const handleTogglePlan = (planId: string) => {
        setSelectedPlanId(prev => (prev === planId ? null : planId));
    };

    const handleProceedToPayment = async () => {
        if (!selectedPlanId) return;

        setIsProcessing(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No estás autenticado.");

            const siteUrl = __DEV__ && process.env.EXPO_PUBLIC_SITE_URL
                ? process.env.EXPO_PUBLIC_SITE_URL
                : (IS_EQUIPOP ? 'https://www.equipop.app' : 'https://www.ruralpop.com');

            const res = await fetch(`${siteUrl}/api/create-payment-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    listingId,
                    planId: selectedPlanId,
                    tenantId: IS_EQUIPOP ? 'equipop' : 'ruralpop'
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error creando el pago");
            }

            const { clientSecret, ephemeralKey, customer } = await res.json();

            // Initialize Stripe Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: IS_EQUIPOP ? 'Equipop' : 'Ruralpop',
                paymentIntentClientSecret: clientSecret,
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
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

        } catch (error: unknown) {
            console.error("Error en pago de destacado:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Ha ocurrido un error al conectar con el procesador de pagos.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // ============================================================================
    // 3. Render
    // ============================================================================

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 16) }
                ]}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Cabecera compacta con icono de éxito */}
                <View style={styles.headerBox}>
                    <View style={styles.checkCircle}>
                        <CheckCircle2 color="#059669" size={28} />
                    </View>
                    <Text style={styles.title}>
                        {isFromVentas ? 'Destaca tu anuncio' : '¡Anuncio subido!'}
                    </Text>
                    <Text style={styles.subtitle}>
                        Multiplica tus ventas destacando tu anuncio por encima de los demás.
                    </Text>
                </View>

                {/* Título de sección */}
                <Text style={styles.sectionTitle}>Elige un plan opcional:</Text>

                {/* Lista de cards compactos con selección/deselección */}
                <View style={styles.cardsList}>
                    {STRIPE_PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isSelected = selectedPlanId === plan.id;

                        return (
                            <TouchableOpacity
                                key={plan.id}
                                onPress={() => handleTogglePlan(plan.id)}
                                activeOpacity={0.75}
                                style={[
                                    styles.card,
                                    isSelected
                                        ? {
                                            borderColor: plan.color,
                                            backgroundColor: plan.bgColor,
                                            borderWidth: 2,
                                        }
                                        : styles.cardUnselected
                                ]}
                            >
                                {plan.badge && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{plan.badge}</Text>
                                    </View>
                                )}

                                <View
                                    style={[
                                        styles.iconBox,
                                        isSelected
                                            ? { backgroundColor: '#ffffff' }
                                            : { backgroundColor: '#f3f4f6' }
                                    ]}
                                >
                                    <Icon
                                        color={isSelected ? plan.color : '#9ca3af'}
                                        size={20}
                                    />
                                </View>

                                <View style={styles.cardInfo}>
                                    <Text
                                        style={[
                                            styles.planName,
                                            isSelected ? { color: '#111827' } : { color: '#374151' }
                                        ]}
                                    >
                                        {plan.name}
                                    </Text>
                                    <Text style={styles.planDesc} numberOfLines={2}>
                                        {plan.description}
                                    </Text>
                                </View>

                                <View style={styles.priceBox}>
                                    <Text
                                        style={[
                                            styles.priceText,
                                            isSelected ? { color: plan.color } : { color: '#6b7280' }
                                        ]}
                                    >
                                        {plan.price.toString().replace('.', ',')}€
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Botón de pago (solo visible si hay un plan seleccionado) */}
                {selectedPlan ? (
                    <TouchableOpacity
                        onPress={handleProceedToPayment}
                        disabled={isProcessing}
                        activeOpacity={0.85}
                        style={[
                            styles.payButton,
                            isProcessing && styles.buttonDisabled
                        ]}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
                        ) : null}
                        <Text style={styles.payButtonText}>
                            Continuar al pago • {selectedPlan.price.toString().replace('.', ',')}€
                        </Text>
                    </TouchableOpacity>
                ) : null}

                {/* Botón de omitir / volver al inicio */}
                <TouchableOpacity
                    onPress={onSkip}
                    disabled={isProcessing}
                    activeOpacity={0.7}
                    style={[
                        styles.skipButton,
                        selectedPlan ? styles.skipButtonSecondary : styles.skipButtonPrimary
                    ]}
                >
                    <Text
                        style={[
                            styles.skipButtonText,
                            !selectedPlan && styles.skipButtonTextPrimary
                        ]}
                    >
                        {isFromVentas
                            ? 'Cerrar'
                            : selectedPlan
                                ? 'No destacar por ahora'
                                : 'Volver al inicio'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ============================================================================
// 4. Stylesheet
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 12,
    },
    checkCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12.5,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 17,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    cardsList: {
        marginBottom: 12,
    },
    card: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    cardUnselected: {
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    badgeContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#059669',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderBottomLeftRadius: 8,
        zIndex: 10,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 8.5,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 6,
    },
    planName: {
        fontSize: 14.5,
        fontWeight: '700',
        marginBottom: 1,
    },
    planDesc: {
        fontSize: 11,
        color: '#6b7280',
        lineHeight: 14.5,
    },
    priceBox: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 54,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '900',
    },
    payButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 9999,
        backgroundColor: '#059669',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    payButtonText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 15,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    skipButton: {
        width: '100%',
        paddingVertical: 11,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    skipButtonPrimary: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    skipButtonSecondary: {
        backgroundColor: '#f9fafb',
    },
    skipButtonText: {
        color: '#6b7280',
        fontWeight: '700',
        fontSize: 13.5,
    },
    skipButtonTextPrimary: {
        color: '#1f2937',
        fontWeight: '800',
        fontSize: 14.5,
    },
});

// ============================================================================
// 5. Documentación de Memoria y Decisiones Técnicas (RULE[user_global])
// ============================================================================
/**
 * Decisiones Técnicas & Lecciones Aprendidas:
 * 1. Optimización de altura vertical (Viewport Fit):
 *    - Los cards previos utilizaban p-6 (24px de padding interno superior e inferior) y márgenes de 16px,
 *      sumado a un header con icono de 48px y espaciados fijos de 64px (pt-16). En pantallas móviles
 *      estándar, esto provocaba que el botón de pago y de omitir quedaran parcialmente cortados o fuera
 *      del campo visual.
 *    - Se optimizaron las dimensiones: padding vertical de 10px en cards, icono de 36px, textos más
 *      ajustados y márgenes de 8px. Esto reduce la altura total en ~160px, permitiendo que ambos botones
 *      se visualicen al 100% sin scroll en cualquier dispositivo.
 * 2. Comportamiento de Toggle (Activar / Desactivar plan):
 *    - Previamente `onPress={() => setSelectedPlanId(plan.id)}` era unidireccional (imposible de deseleccionar).
 *    - Se implementó `handleTogglePlan` con `prev === planId ? null : planId`, permitiendo al usuario
 *      deseleccionar pulsando de nuevo sobre el card activo o cambiar a otro.
 *    - Al desactivar el plan, el botón superior desaparece y el botón inferior se convierte en la acción
 *      principal ("Volver al inicio" / "Cerrar").
 * 3. Adaptabilidad y Scroll de seguridad:
 *    - Se encapsuló la vista en un ScrollView con safe area insets dinámicos para que dispositivos con
 *      fuentes grandes o pantallas compactas (ej. iPhone SE) puedan deslizar cómodamente sin overflow.
 * 4. Type Safety:
 *    - Eliminado el uso de `any` en el bloque catch de la pasarela de pagos Stripe, sustituyéndolo por
 *      tipado seguro con `error: unknown` e instanciación de `Error`.
 */
