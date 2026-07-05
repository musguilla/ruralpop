import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { UserPlus } from 'lucide-react-native';
import { getRuralpopDatabaseId, ACTIVE_TENANT_ID } from '../../src/config/tenants';

const isEquipop = ACTIVE_TENANT_ID === '69d55371-2f70-4e67-b55c-4502bce305bb';
const primaryColor = isEquipop ? '#1E3A8A' : '#059669';
const primaryMutedColor = isEquipop ? '#DBEAFE' : '#d1fae5';
const primaryHoverColor = isEquipop ? '#1E40AF' : '#047857';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        if (!email || !password || !fullName) {
            Alert.alert('Faltan datos', 'Por favor rellena todos los campos obligatorios.');
            return;
        }
        setLoading(true);

        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    name: fullName,
                    tenant_id: getRuralpopDatabaseId() || undefined,
                }
            }
        });

        if (error) {
            if (error.message.includes("User already registered") || error.code === "user_already_exists") {
                Alert.alert(
                    '¡Ya tienes cuenta en nuestra red!', 
                    'Este correo electrónico ya está registrado en nuestra plataforma (Ruralpop/Equipop). Puedes usar tu contraseña habitual para Iniciar Sesión en esta app.',
                    [
                        { text: 'Ir a Iniciar Sesión', onPress: () => router.replace('/(auth)/login') },
                        { text: 'Cancelar', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Error en registro', error.message);
            }
        } else {
            if (!session) {
                Alert.alert('Revisa tu correo', 'Te hemos enviado un enlace para confirmar tu email.');
                router.replace('/(auth)/login');
            } else {
                router.replace('/(tabs)/');
            }
        }
        setLoading(false);
    }

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
                        <UserPlus color={primaryColor} size={32} />
                    </View>
                    <Text style={styles.title}>Crea tu cuenta</Text>
                    <Text style={styles.subtitle}>
                        Únete a la mayor comunidad de anuncios del campo.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre completo</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                onChangeText={setFullName}
                                value={fullName}
                                placeholder="Ej: Juan Pérez"
                                autoCapitalize="words"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                onChangeText={setEmail}
                                value={email}
                                placeholder="tu@email.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <View style={[styles.inputGroup, styles.marginBottom]}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={true}
                                placeholder="Mínimo 6 caracteres"
                                autoCapitalize="none"
                                placeholderTextColor="#9ca3af"
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={signUpWithEmail}
                        disabled={loading}
                        style={[styles.button, { backgroundColor: loading ? primaryHoverColor : primaryColor }, loading && styles.buttonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Crear Cuenta</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                            <Text style={[styles.footerLink, { color: primaryColor }]}>Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    marginBottom: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    inputContainer: {
        width: '100%',
        height: 48,
        paddingHorizontal: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        color: '#111827',
        height: '100%',
    },
    button: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: {
        color: '#6b7280',
    },
    footerLink: {
        fontWeight: 'bold',
    },
});
