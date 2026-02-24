import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        if (!email || !password || !fullName) {
            Alert.alert('Faltan datos', 'Por favor rellena todos los campos oblígatorios.');
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
                }
            }
        });

        if (error) {
            Alert.alert('Error en registro', error.message);
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
        <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-4">
                    <UserPlus className="text-primary" size={32} />
                </View>
                <Text className="text-3xl font-extrabold text-text">Crea tu cuenta</Text>
                <Text className="text-text-muted text-center mt-2">
                    Únete a la mayor comunidad de anuncios del campo.
                </Text>
            </View>

            <View className="space-y-4">
                <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-1">Nombre completo</Text>
                    <TextInput
                        onChangeText={(text) => setFullName(text)}
                        value={fullName}
                        placeholder="Ej: Juan Pérez"
                        autoCapitalize="words"
                        className="w-full h-12 px-4 bg-surface-muted border border-gray-200 rounded-xl text-text"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-1">Correo electrónico</Text>
                    <TextInput
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="tu@email.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        className="w-full h-12 px-4 bg-surface-muted border border-gray-200 rounded-xl text-text"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-medium text-text mb-1">Contraseña</Text>
                    <TextInput
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Mínimo 6 caracteres"
                        autoCapitalize="none"
                        className="w-full h-12 px-4 bg-surface-muted border border-gray-200 rounded-xl text-text"
                    />
                </View>

                <TouchableOpacity
                    onPress={signUpWithEmail}
                    disabled={loading}
                    className={`w-full h-12 rounded-full items-center justify-center mb-4 ${loading ? 'bg-primary-hover opacity-70' : 'bg-primary'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Crear Cuenta</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-text-muted">¿Ya tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text className="text-primary font-bold">Inicia Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
