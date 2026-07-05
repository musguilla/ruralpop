import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { User, Eye, EyeOff } from 'lucide-react-native';
import { ACTIVE_TENANT_ID } from '../../src/config/tenants';

const isEquipop = ACTIVE_TENANT_ID === '69d55371-2f70-4e67-b55c-4502bce305bb';
const primaryColor = isEquipop ? '#1E3A8A' : '#059669';
const primaryMutedColor = isEquipop ? '#DBEAFE' : '#d1fae5';
const primaryHoverColor = isEquipop ? '#1E40AF' : '#047857';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error al iniciar sesión', error.message);
        } else {
            router.replace('/(tabs)/');
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
                        <User color={primaryColor} size={32} />
                    </View>
                    <Text style={styles.title}>Bienvenido de nuevo</Text>
                    <Text style={styles.subtitle}>
                        Inicia sesión para gestionar tus anuncios y comunicarte con compradores.
                    </Text>
                </View>

                <View style={styles.form}>
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
                        <View style={styles.passwordContainer}>
                            <TextInput
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
                                placeholder="••••••••"
                                autoCapitalize="none"
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

                    <TouchableOpacity
                        onPress={signInWithEmail}
                        disabled={loading}
                        style={[styles.button, { backgroundColor: loading ? primaryHoverColor : primaryColor }, loading && styles.buttonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={[styles.footerLink, { color: primaryColor }]}>Regístrate</Text>
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
        marginBottom: 24,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 48,
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
    },
    eyeButton: {
        padding: 8,
        marginRight: -8,
    },
    button: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: 24,
    },
    footerText: {
        color: '#6b7280',
    },
    footerLink: {
        fontWeight: 'bold',
    },
});
