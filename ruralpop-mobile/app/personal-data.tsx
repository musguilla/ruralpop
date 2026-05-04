import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { ChevronLeft, User, Phone, CheckCircle2, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { Image } from 'expo-image';

import { LocationModal } from '../src/components/ui/modals/LocationModal';
import { MunicipalityModal } from '../src/components/ui/modals/MunicipalityModal';
import { LOCATIONS } from '../src/constants/locations';
import { getOptimizedImageUrl } from '../src/lib/image-optimization';

export default function PersonalDataScreen() {
    const { user, session } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationId, setLocationId] = useState<string | null>(null);
    const [municipality, setMunicipality] = useState<{ id: number, name: string } | null>(null);

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (!user || !session) return;

        async function fetchUserData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('name, contact_phone, avatar_url, location, municipality_id')
                .eq('id', user?.id)
                .single();

            if (data) {
                // Support both full_name or name from supabase
                setName(data.name || user?.user_metadata?.full_name || '');
                setPhone(data.contact_phone || '');
                setAvatarUrl(data.avatar_url || user?.user_metadata?.avatar_url || null);

                // Parse existing location if available (Format: "Municipality, Province" or "Province")
                if (data.location) {
                    const parts = data.location.split(', ');
                    if (parts.length === 2) {
                        setMunicipality({ id: data.municipality_id || 0, name: parts[0] });
                        setLocationId(parts[1]);
                    } else if (parts.length === 1) {
                        setLocationId(parts[0]);
                    }
                }
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

        const selectedProvinceObj = LOCATIONS.find(l => l.name === locationId);
        const provinceNumericId = selectedProvinceObj ? parseInt(selectedProvinceObj.id, 10) : null;
        const fullLocationString = municipality && locationId ? `${municipality.name}, ${locationId}` : locationId;

        const { error } = await supabase
            .from('users')
            .update({
                name: name.trim(),
                contact_phone: phone.trim(),
                location: fullLocationString,
                province_id: provinceNumericId,
                municipality_id: municipality?.id || null
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
            quality: 1, // We will compress during manipulation
            base64: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            
            // Resize and compress
            const manipResult = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { width: 500 } }], // Smaller size for avatars
                { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP, base64: true }
            );

            if (manipResult.base64) {
                // Pass a mocked asset object that has the base64 injected
                uploadAvatar({ ...asset, base64: manipResult.base64, uri: manipResult.uri });
            }
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!user || !asset.base64) return;

        setIsUploadingImage(true);
        try {
            const fileExt = asset.uri.split('.').pop() || 'jpg';
            const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

            // Fetch presign URL from backend
            const ruralpopDomain = 'https://www.ruralpop.com'; 
            const presignRes = await fetch(`${ruralpopDomain}/api/upload/presign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: fileName,
                    contentType: `image/${fileExt === 'png' ? 'png' : fileExt === 'webp' ? 'webp' : 'jpeg'}`,
                    folder: "users"
                }),
            });

            if (!presignRes.ok) {
                 const errText = await presignRes.text();
                 throw new Error(`Error en pre-firma: ${errText}`);
            }

            const { presignedUrl, publicUrl } = await presignRes.json();

            // Native Fetch PUT binary blob in React Native
            const binaryData = decode(asset.base64);
            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": `image/${fileExt === 'png' ? 'png' : fileExt === 'webp' ? 'webp' : 'jpeg'}`,
                },
                body: binaryData as any
            });

            if (!uploadRes.ok) {
                throw new Error("Error físico al escribir en R2 Edge.");
            }

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
                <Text className="text-xl font-bold text-text ml-2">Mi cuenta</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={handlePickAvatar} className="relative mb-2 mt-4">
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 96, height: 96, borderRadius: 48 }}
                                className="border border-gray-200"
                                contentFit="cover"
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
                    {/* Nombre y Apellidos */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-2">Nombre completo</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Tu nombre y apellidos"
                            autoCapitalize="words"
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    {/* Email (Read only) */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-2">Correo Electrónico</Text>
                        <TextInput
                            value={email}
                            editable={false}
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                        />
                        <Text className="text-xs text-text-muted mt-1 mb-2">
                            El correo electrónico no puede modificarse por seguridad.
                        </Text>
                    </View>

                    {/* Teléfono */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-2">Teléfono de contacto</Text>
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
                        <Text className="text-xs text-text-muted mt-1 mb-2">
                            Aparecerá pre-completado cuando publiques nuevos anuncios.
                        </Text>
                    </View>

                    {/* Provincia */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-2">Provincia</Text>
                        <TouchableOpacity
                            onPress={() => setIsLocationModalOpen(true)}
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center"
                        >
                            <Text className={`text-base ${locationId ? 'text-text' : 'text-gray-400'}`}>
                                {locationId || 'Selecciona provincia...'}
                            </Text>
                            <ChevronLeft color="#9ca3af" size={20} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {/* Localidad */}
                    <View>
                        <Text className="text-sm font-bold text-text mb-2 mt-2">Localidad</Text>
                        <TouchableOpacity
                            onPress={() => locationId ? setIsMunicipalityModalOpen(true) : Alert.alert('Aviso', 'Selecciona primero una provincia')}
                            className={`w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center ${!locationId ? 'opacity-50' : ''}`}
                        >
                            <Text className={`text-base ${municipality ? 'text-text' : 'text-gray-400'}`}>
                                {municipality ? municipality.name : 'Selecciona localidad...'}
                            </Text>
                            <ChevronLeft color="#9ca3af" size={20} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
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
                <LocationModal
                    visible={isLocationModalOpen}
                    onClose={() => setIsLocationModalOpen(false)}
                    selectedLocation={locationId}
                    onSelect={(loc) => {
                        setLocationId(loc);
                        setMunicipality(null);
                        setIsLocationModalOpen(false);
                    }}
                />

                <MunicipalityModal
                    visible={isMunicipalityModalOpen}
                    onClose={() => setIsMunicipalityModalOpen(false)}
                    provinceId={LOCATIONS.find(l => l.name === locationId)?.id || null}
                    selectedMunicipality={municipality}
                    onSelect={(mun) => {
                        setMunicipality(mun);
                        setIsMunicipalityModalOpen(false);
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
