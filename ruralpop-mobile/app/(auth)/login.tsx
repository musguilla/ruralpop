import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { User, Eye, EyeOff } from 'lucide-react-native';

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
        <View className="flex-1 bg-surface justify-center px-6">
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-4">
                    <User className="text-primary w-8 h-8" size={32} />
                </View>
                <Text className="text-3xl font-extrabold text-text">Bienvenido de nuevo</Text>
                <Text className="text-text-muted text-center mt-2">
                    Inicia sesión para gestionar tus anuncios y comunicarte con compradores.
                </Text>
            </View>

            <View className="space-y-4">
                <View>
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

                <View className="mb-6">
                    <Text className="text-sm font-medium text-text mb-1 mt-4">Contraseña</Text>
                    <View className="flex-row items-center w-full h-12 px-4 bg-surface-muted border border-gray-200 rounded-xl">
                        <TextInput
                            onChangeText={(text) => setPassword(text)}
                            value={password}
                            secureTextEntry={!showPassword}
                            placeholder="••••••••"
                            autoCapitalize="none"
                            className="flex-1 text-text h-full"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="p-2 -mr-2"
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
                    className={`w-full h-12 rounded-full items-center justify-center ${loading ? 'bg-primary-hover opacity-70' : 'bg-primary'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Inciar Sesión</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-text-muted">¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text className="text-primary font-bold">Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
