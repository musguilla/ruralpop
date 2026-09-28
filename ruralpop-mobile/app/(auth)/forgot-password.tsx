import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react-native';
import { ACTIVE_TENANT_ID } from '../../src/config/tenants';

const isEquipop = ACTIVE_TENANT_ID === '69d55371-2f70-4e67-b55c-4502bce305bb';
const primaryColor = isEquipop ? '#1E3A8A' : '#059669';
const primaryMutedColor = isEquipop ? '#DBEAFE' : '#d1fae5';
const primaryHoverColor = isEquipop ? '#1E40AF' : '#047857';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const handleSendRecoveryEmail = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            Alert.alert('Email inválido', 'Por favor, introduce una dirección de correo electrónico válida.');
            return;
        }

        setLoading(true);

        try {
            const apiEndpoint = isEquipop
                ? 'https://www.equipop.app/api/auth/forgot-password'
                : 'https://www.ruralpop.com/api/auth/forgot-password';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: trimmedEmail,
                    tenant: isEquipop ? 'equipop' : 'ruralpop',
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSent(true);
            } else {
                Alert.alert(
                    'Aviso',
                    data.message || 'Si la cuenta existe, recibirás las instrucciones en tu correo.'
                );
                setSent(true);
            }
        } catch {
            Alert.alert(
                'Error de conexión',
                'No hemos podido conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <ArrowLeft color="#374151" size={24} />
                </TouchableOpacity>

                {sent ? (
                    <View style={styles.successContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                            <CheckCircle2 color="#16a34a" size={40} />
                        </View>
                        <Text style={styles.title}>Revisa tu correo</Text>
                        <Text style={styles.subtitle}>
                            Hemos enviado un enlace seguro para restablecer tu contraseña a:
                        </Text>
                        <Text style={styles.emailHighlight}>{email.trim()}</Text>
                        <Text style={styles.infoText}>
                            Abre el enlace desde tu móvil o navegador para establecer tu nueva contraseña. Si no lo ves en unos minutos, revisa tu carpeta de spam.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.replace('/(auth)/login')}
                            style={[styles.button, { backgroundColor: primaryColor, marginTop: 32 }]}
                        >
                            <Text style={styles.buttonText}>Volver a Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: primaryMutedColor }]}>
                                <KeyRound color={primaryColor} size={32} />
                            </View>
                            <Text style={styles.title}>Recuperar contraseña</Text>
                            <Text style={styles.subtitle}>
                                Introduce el correo electrónico asociado a tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correo electrónico</Text>
                                <View style={styles.inputContainer}>
                                    <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
                                    <TextInput
                                        onChangeText={setEmail}
                                        value={email}
                                        placeholder="tu@email.com"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        placeholderTextColor="#9ca3af"
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSendRecoveryEmail}
                                disabled={loading}
                                style={[
                                    styles.button,
                                    { backgroundColor: loading ? primaryHoverColor : primaryColor },
                                    loading && styles.buttonDisabled,
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Enviar enlace</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelText}>Cancelar y volver</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        paddingHorizontal: 12,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        paddingHorizontal: 14,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#111827',
        height: '100%',
        fontSize: 15,
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    cancelText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
    },
    successContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emailHighlight: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
        marginBottom: 16,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 18,
    },
});

/**
 * Memory / Decisiones Técnicas:
 * - Se añade pantalla nativa de recuperación de contraseña en Expo Router para cerrar la brecha de usuarios
 *   que se desloguean en la app móvil y no recuerdan su contraseña.
 * - Conecta con el endpoint seguro anti-scanner de /api/auth/forgot-password para que los correos que salgan
 *   nunca quemen tokens de un solo uso en escáneres de Hotmail / Outlook.
 */
