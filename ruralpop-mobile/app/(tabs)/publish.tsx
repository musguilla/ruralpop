import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Key, Camera, X, CheckCircle2, ChevronDown, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../src/lib/supabase';
import { decode } from "base64-arraybuffer";
import { CategoryModal } from '../../src/components/ui/modals/CategoryModal';
import { LocationModal } from '../../src/components/ui/modals/LocationModal';
import { MunicipalityModal } from '../../src/components/ui/modals/MunicipalityModal';
import { CATEGORIES, PRICE_TYPES } from '../../src/constants/categories';
import { LOCATIONS } from '../../src/constants/locations';

export default function PublishScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceType, setPriceType] = useState('fixed');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [locationId, setLocationId] = useState<string | null>(null); // name of province
    const [municipality, setMunicipality] = useState<{ id: number, name: string } | null>(null);
    const [phone, setPhone] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (user?.id && session) {
                async function fetchPhone() {
                    const { data } = await supabase.from('users').select('phone').eq('id', user?.id).single();
                    if (data?.phone) setPhone(data.phone);
                }
                fetchPhone();
            }
        }, [user?.id, session])
    );

    if (isLoading) return null;

    if (!session) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <View className="w-16 h-16 bg-primary-muted rounded-full items-center justify-center mb-6">
                    <Key className="text-primary" size={32} />
                </View>
                <Text className="text-xl font-bold text-center text-text mb-2">Inicia sesión para publicar</Text>
                <Text className="text-center text-text-muted mb-8">
                    Sube tus productos o animales y llega a miles de compradores en el entorno rural.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full mb-2 w-full items-center"
                >
                    <Text className="text-white font-bold text-base">Iniciar sesión</Text>
                </TouchableOpacity>
                <Text className="text-text-muted mt-4 mb-4">Si no tienes una cuenta</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="border-2 border-primary px-8 py-3 rounded-full w-full items-center"
                >
                    <Text className="text-primary font-bold text-base">Registrarme</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1, // We will compress during manipulation
            base64: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            
            // Resize and compress
            const manipResult = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { width: 1200 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );

            if (manipResult.base64) {
                setImages([...images, `data:image/jpeg;base64,${manipResult.base64}`]);
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = [];
        const ruralpopDomain = 'https://www.ruralpop.com';

        for (let i = 0; i < images.length; i++) {
            const base64Img = images[i];
            if (base64Img.startsWith('data:image')) {
                const base64Str = base64Img.split(',')[1];
                const fileName = `${user?.id}-${Date.now()}-${i}.jpg`;

                try {
                    const presignRes = await fetch(`${ruralpopDomain}/api/upload/presign`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            filename: fileName,
                            contentType: "image/jpeg",
                            folder: "listings"
                        }),
                    });

                    if (!presignRes.ok) throw new Error("Presign Error");

                    const { presignedUrl, publicUrl } = await presignRes.json();
                    
                    const binaryData = decode(base64Str);
                    const uploadRes = await fetch(presignedUrl, {
                        method: "PUT",
                        headers: { "Content-Type": "image/jpeg" },
                        body: binaryData as any
                    });

                    if (!uploadRes.ok) throw new Error("Upload Error");

                    urls.push(publicUrl);
                } catch (e: any) {
                    console.error("Upload error", e);
                }
            } else {
                urls.push(base64Img);
            }
        }

        return urls;
    };

    const handlePublish = async () => {
        if (!title || !description || !price || !locationId || !categoryId) {
            Alert.alert('Faltan datos', 'Por favor, rellena todos los campos obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrls = await uploadImages();

            // Guardar el telefono si hay uno nuevo
            if (phone && phone.trim().length > 0) {
                await supabase.from('users').update({ phone: phone.trim() }).eq('id', user?.id);
            }

            // Derivar category y subcategory a raiz de categoryId
            let finalCategory = categoryId;
            let finalSubcategory: string | null = null;

            for (const cat of CATEGORIES) {
                if (cat.id === categoryId) {
                    finalCategory = cat.id;
                    break;
                }
                const foundSub = cat.subcategories?.find(s => s.toLowerCase() === categoryId.toLowerCase());
                if (foundSub) {
                    finalCategory = cat.id;
                    finalSubcategory = foundSub;
                    break;
                }
            }

            const selectedProvinceObj = LOCATIONS.find(l => l.name === locationId);
            const provinceNumericId = selectedProvinceObj ? parseInt(selectedProvinceObj.id, 10) : null;
            const fullLocationString = municipality ? `${municipality.name}, ${locationId}` : locationId;

            const { data, error } = await supabase
                .from('listings')
                .insert({
                    title,
                    description,
                    price: parseFloat(price.replace(',', '.')),
                    price_type: priceType,
                    location: fullLocationString,
                    province_id: provinceNumericId,
                    municipality_id: municipality?.id || null,
                    user_id: user?.id,
                    image_urls: imageUrls,
                    category: finalCategory,
                    subcategory: finalSubcategory,
                    contact_phone: phone,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            setSuccess(true);

            // Reset form
            setTimeout(() => {
                setTitle('');
                setDescription('');
                setPrice('');
                setLocationId(null);
                setMunicipality(null);
                setCategoryId(null);
                setImages([]);
                setSuccess(false);
                router.push('/(tabs)/');
            }, 2000);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al publicar el anuncio');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <CheckCircle2 className="text-primary mb-4" size={64} />
                <Text className="text-2xl font-bold text-text mb-2 text-center">¡Anuncio publicado!</Text>
                <Text className="text-text-muted text-center">Tu anuncio ya está visible para todos.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <View className="px-6 py-4 border-b border-gray-100 bg-white">
                <Text className="text-2xl font-extrabold text-text">Publicar Anuncio</Text>
            </View>

            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-text mb-2">Fotos del producto</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {images.map((uri, index) => (
                            <View key={index} className="relative w-24 h-24 rounded-xl overflow-hidden mr-3 border border-gray-200">
                                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                                >
                                    <X color="white" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {images.length < 5 && (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50 mr-3"
                            >
                                <Camera className="text-gray-400 mb-1" size={24} />
                                <Text className="text-xs text-gray-500 font-medium">Añadir</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                <View>
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Título del anuncio *</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Ej. Tractor John Deere 5090M"
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Categoría y Subcategoría *</Text>
                        <TouchableOpacity
                            onPress={() => setIsCategoryModalOpen(true)}
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        >
                            <Text className={`text-base ${categoryId ? 'text-text' : 'text-gray-400'}`}>
                                {categoryId ? (categoryId.charAt(0).toUpperCase() + categoryId.slice(1)) : 'Selecciona categoría...'}
                            </Text>
                            <ChevronDown color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Descripción detallada *</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe el estado, año, raza, mantenimiento..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="w-full h-32 bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    <View className="flex-row space-x-3 mb-6">
                        <View className="flex-[0.8]">
                            <Text className="text-sm font-bold text-text mb-2">Precio (€) *</Text>
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0"
                                keyboardType="numeric"
                                className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text font-bold text-lg"
                            />
                        </View>
                        <View className="flex-[1.2]">
                            <Text className="text-sm font-bold text-text mb-2">Tipo de precio</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    const idx = PRICE_TYPES.findIndex(p => p.id === priceType);
                                    const next = PRICE_TYPES[(idx + 1) % PRICE_TYPES.length];
                                    setPriceType(next.id);
                                }}
                                className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center"
                            >
                                <Text className="text-base text-text" numberOfLines={1}>
                                    {PRICE_TYPES.find(p => p.id === priceType)?.label}
                                </Text>
                                <ChevronDown color="#9ca3af" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Provincia *</Text>
                        <TouchableOpacity
                            onPress={() => setIsLocationModalOpen(true)}
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        >
                            <Text className={`text-base ${locationId ? 'text-text' : 'text-gray-400'}`}>
                                {locationId || 'Selecciona provincia...'}
                            </Text>
                            <ChevronDown color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Localidad</Text>
                        <TouchableOpacity
                            onPress={() => locationId ? setIsMunicipalityModalOpen(true) : Alert.alert('Aviso', 'Selecciona primero una provincia')}
                            className={`w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center ${!locationId ? 'opacity-50' : ''}`}
                        >
                            <Text className={`text-base ${municipality ? 'text-text' : 'text-gray-400'}`}>
                                {municipality ? municipality.name : 'Selecciona localidad...'}
                            </Text>
                            <ChevronDown color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text mb-2">Teléfono de contacto</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Ej: 600 000 000"
                            keyboardType="phone-pad"
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                </View>

                <TouchableOpacity
                    onPress={handlePublish}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-full items-center justify-center mt-8 mb-8 ${isSubmitting ? 'bg-primary-hover opacity-70' : 'bg-primary'
                        }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Publicar Anuncio</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            <CategoryModal
                visible={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                selectedCategory={categoryId}
                onSelect={(cat) => {
                    setCategoryId(cat);
                    setIsCategoryModalOpen(false);
                }}
            />

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
        </SafeAreaView>
    );
}
