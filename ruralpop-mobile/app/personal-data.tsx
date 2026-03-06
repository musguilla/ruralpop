import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { ChevronLeft, User, Phone, CheckCircle2, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Image } from 'react-native';

export default function PersonalDataScreen() {
    const { user, session } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (!user || !session) return;

        async function fetchUserData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('name, contact_phone, avatar_url')
                .eq('id', user?.id)
                .single();

            if (data) {
                // Support both full_name or name from supabase
                setName(data.name || user?.user_metadata?.full_name || '');
                setPhone(data.contact_phone || '');
                setAvatarUrl(data.avatar_url || user?.user_metadata?.avatar_url || null);
            }
            if (user?.email) {
                setEmail(user.email);
            }
            setLoading(false);
        }

        fetchUserData();
    }, [user, session]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSuccessMessage(false);

        const { error } = await supabase
            .from('users')
            .update({
                name: name.trim(),
                contact_phone: phone.trim()
            })
            .eq('id', user.id);

        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: name.trim() }
        });

        setIsSaving(false);

        if (error || authError) {
            Alert.alert('Error', 'No se pudieron guardar los cambios. ' + (error?.message || authError?.message || ''));
        } else {
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000); // Hide after 3 seconds
        }
    };

    const handlePickAvatar = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            uploadAvatar(result.assets[0]);
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!user || !asset.base64) return;

        setIsUploadingImage(true);
        try {
            const fileExt = asset.uri.split('.').pop() || 'jpg';
            const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('users')
                .upload(fileName, decode(asset.base64), {
                    contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('users')
                .getPublicUrl(fileName);

            // Fetch publicUrl again to prevent caching issues if same name (we use timestamp so it shouldn't happen)
            setAvatarUrl(publicUrl);

            // Update Auth Metadata
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            // Update Users Table
            await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);

            Alert.alert("Éxito", "Tu foto de perfil ha sido actualizada.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Error al subir la imagen.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Mis Datos Personales</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={handlePickAvatar} className="relative mb-2">
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                className="w-24 h-24 rounded-full border border-gray-200"
                            />
                        ) : (
                            <View className="w-24 h-24 bg-primary-muted rounded-full items-center justify-center">
                                <User className="text-primary" size={48} />
                            </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white shadow-sm">
                            <Camera color="white" size={16} />
                        </View>
                        {isUploadingImage && (
                            <View className="absolute inset-0 bg-white/60 rounded-full items-center justify-center">
                                <ActivityIndicator color="#059669" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text className="text-text-muted text-sm text-center px-4 mt-2">
                        Actualiza tu foto e información para que los compradores confíen más en ti.
                    </Text>
                </View>

                {successMessage && (
                    <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex-row items-center">
                        <CheckCircle2 color="#059669" size={20} />
                        <Text className="text-green-800 font-medium ml-2 flex-1">
                            Ajustes guardados correctamente.
                        </Text>
                    </View>
                )}

                <View className="space-y-4">
                    {/* Email (Read only) */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2">Correo Electrónico</Text>
                        <TextInput
                            value={email}
                            editable={false}
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                        />
                        <Text className="text-xs text-text-muted mt-1">
                            El correo electrónico no puede modificarse por seguridad.
                        </Text>
                    </View>

                    {/* Nombre y Apellidos */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-4">Nombre Completo</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Tu nombre y apellidos"
                            autoCapitalize="words"
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    {/* Teléfono */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-4">Teléfono de contacto</Text>
                        <View className="flex-row items-center w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3">
                            <Phone color="#9ca3af" size={18} />
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Ej: 600 000 000"
                                keyboardType="phone-pad"
                                className="flex-1 ml-3 text-text text-base"
                                style={{ paddingVertical: 0 }}
                            />
                        </View>
                        <Text className="text-xs text-text-muted mt-1">
                            Aparecerá pre-completado cuando publiques nuevos anuncios.
                        </Text>
                    </View>
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-full items-center justify-center mt-10 mb-8 ${isSaving ? 'bg-primary-hover opacity-70' : 'bg-primary'
                        }`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
