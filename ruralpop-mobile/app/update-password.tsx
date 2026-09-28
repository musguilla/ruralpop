import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { ACTIVE_TENANT_ID } from '../src/config/tenants';

const isEquipop = ACTIVE_TENANT_ID === '69d55371-2f70-4e67-b55c-4502bce305bb';
const primaryColor = isEquipop ? '#1E3A8A' : '#059669';
const primaryMutedColor = isEquipop ? '#DBEAFE' : '#d1fae5';
const primaryHoverColor = isEquipop ? '#1E40AF' : '#047857';

export default function UpdatePasswordScreen() {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [hasValidSession, setHasValidSession] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();
    const params = useLocalSearchParams<{
        token_hash?: string;
        type?: string;
        code?: string;
        error?: string;
        error_description?: string;
    }>();

    useEffect(() => {
        const verifyRecoveryToken = async () => {
            setVerifying(true);

            if (params.error_description || params.error) {
                setErrorMessage(params.error_description || params.error || 'El enlace no es válido.');
                setVerifying(false);
                return;
            }

            // 1. Verificación por token_hash anti-scanner
            if (params.token_hash) {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash: params.token_hash,
                    type: (params.type as any) || 'recovery',
                });

                if (error) {
                    console.error('Error verifying token_hash in mobile:', error.message);
                    setErrorMessage('El enlace de recuperación ha caducado o ya fue utilizado.');
                } else {
                    setHasValidSession(true);
                }
                setVerifying(false);
                return;
            }

            // 2. Verificación por código PKCE
            if (params.code) {
                const { error } = await supabase.auth.exchangeCodeForSession(params.code);
                if (error) {
                    console.error('Error exchanging code in mobile:', error.message);
                    setErrorMessage('El enlace de recuperación ha caducado.');
                } else {
                    setHasValidSession(true);
                }
                setVerifying(false);
                return;
            }

            // 3. Comprobar si ya existe sesión activa de usuario
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setHasValidSession(true);
            } else {
                setErrorMessage('No se ha detectado una sesión válida de recuperación.');
            }
            setVerifying(false);
        };

        verifyRecoveryToken();
    }, [params.token_hash, params.type, params.code, params.error, params.error_description]);

    const handleUpdatePassword = async () => {
        if (!password || password.length < 6) {
            Alert.alert('Contraseña demasiado corta', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== passwordConfirm) {
            Alert.alert('Las contraseñas no coinciden', 'Por favor, asegúrate de escribir la misma contraseña en ambos campos.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error al guardar', error.message || 'No se ha podido actualizar la contraseña.');
        } else {
            setSuccessMessage('Tu contraseña se ha actualizado correctamente.');
            Alert.alert(
                '¡Contraseña actualizada!',
                'Tu nueva contraseña se ha guardado con éxito. Ya puedes acceder.',
                [
                    {
                        text: 'Ir al Inicio',
                        onPress: () => router.replace('/(tabs)/'),
                    },
                ]
            );
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
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: primaryMutedColor }]}>
                        <Lock color={primaryColor} size={32} />
                    </View>
                    <Text style={styles.title}>Nueva contraseña</Text>
                    <Text style={styles.subtitle}>
                        Crea una contraseña segura para proteger tu cuenta de {isEquipop ? 'Equipop' : 'Ruralpop'}.
                    </Text>
                </View>

                {verifying ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={primaryColor} />
                        <Text style={styles.stateText}>Verificando enlace seguro...</Text>
                    </View>
                ) : errorMessage && !hasValidSession ? (
                    <View style={styles.stateContainer}>
                        <View style={[styles.stateIconCircle, { backgroundColor: '#fee2e2' }]}>
                            <AlertCircle color="#dc2626" size={36} />
                        </View>
                        <Text style={styles.errorTitle}>Enlace no disponible</Text>
                        <Text style={styles.errorDescription}>{errorMessage}</Text>

                        <TouchableOpacity
                            onPress={() => router.replace('/(auth)/forgot-password')}
                            style={[styles.button, { backgroundColor: primaryColor, marginTop: 24 }]}
                        >
                            <Text style={styles.buttonText}>Solicitar nuevo enlace</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/(auth)/login')}
                            style={styles.textButton}
                        >
                            <Text style={[styles.textButtonLabel, { color: primaryColor }]}>
                                Volver al inicio de sesión
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : successMessage ? (
                    <View style={styles.stateContainer}>
                        <View style={[styles.stateIconCircle, { backgroundColor: '#dcfce7' }]}>
                            <CheckCircle2 color="#16a34a" size={40} />
                        </View>
                        <Text style={styles.title}>¡Todo listo!</Text>
                        <Text style={styles.subtitle}>{successMessage}</Text>

                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/')}
                            style={[styles.button, { backgroundColor: primaryColor, marginTop: 28 }]}
                        >
                            <Text style={styles.buttonText}>Entrar a la app</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nueva contraseña</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    onChangeText={setPassword}
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    placeholder="Al menos 6 caracteres"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? (
                                        <EyeOff color="#9ca3af" size={20} />
                                    ) : (
                                        <Eye color="#9ca3af" size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Repite la nueva contraseña</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    onChangeText={setPasswordConfirm}
                                    value={passwordConfirm}
                                    secureTextEntry={!showPasswordConfirm}
                                    placeholder="Repite tu nueva contraseña"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    style={styles.eyeButton}
                                >
                                    {showPasswordConfirm ? (
                                        <EyeOff color="#9ca3af" size={20} />
                                    ) : (
                                        <Eye color="#9ca3af" size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
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
                                <Text style={styles.buttonText}>Guardar contraseña</Text>
                            )}
                        </TouchableOpacity>
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
        marginBottom: 16,
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
        paddingHorizontal: 16,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        paddingHorizontal: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    input: {
        flex: 1,
        color: '#111827',
        height: '100%',
        fontSize: 15,
    },
    eyeButton: {
        padding: 8,
        marginRight: -8,
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    stateContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    stateText: {
        marginTop: 16,
        color: '#6b7280',
        fontSize: 15,
    },
    stateIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    errorDescription: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    textButton: {
        marginTop: 16,
        paddingVertical: 8,
    },
    textButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
});

/**
 * Memory / Decisiones Técnicas:
 * - Soporte Deep Linking Nativo: Cuando un usuario pulsa el enlace de recuperación en el móvil,
 *   los App Links / Universal Links abren esta pantalla directamente en la app nativa en vez de caer en un 404.
 * - Anti-Scanner Token Verification: Valida token_hash o PKCE de forma segura y actualiza la contraseña
 *   con supabase.auth.updateUser.
 */
