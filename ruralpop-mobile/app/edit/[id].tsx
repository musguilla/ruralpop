import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, X, CheckCircle2, ChevronDown, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../src/lib/supabase';
import { decode } from "base64-arraybuffer";
import { CategoryModal } from '../../src/components/ui/modals/CategoryModal';
import { LocationModal } from '../../src/components/ui/modals/LocationModal';
import { MunicipalityModal } from '../../src/components/ui/modals/MunicipalityModal';
import { CATEGORIES, PRICE_TYPES } from '../../src/constants/categories';
import { LOCATIONS } from '../../src/constants/locations';

export default function EditListingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { session, user, isLoading } = useAuth();
    const router = useRouter();

    const [initialLoading, setInitialLoading] = useState(true);

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

    useEffect(() => {
        if (!user || !id) {
            if (!isLoading) {
                setInitialLoading(false);
            }
            return;
        }

        async function fetchListing() {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user!.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setTitle(data.title);
                    setDescription(data.description);
                    setPrice(data.price.toString());
                    setPriceType(data.price_type || 'fixed');

                    // Show subcategory if present, else category
                    setCategoryId(data.subcategory || data.category);

                    // Parse location for province and municipality. Formats: "Oviedo, Asturias"
                    const parts = data.location?.split(', ') || [];
                    if (parts.length > 1) {
                        setLocationId(parts[1]);
                        setMunicipality({ id: data.municipality_id || 0, name: parts[0] });
                    } else if (parts.length === 1) {
                        setLocationId(parts[0]);
                    }

                    setPhone(data.contact_phone || '');

                    if (data.image_urls) {
                        setImages(data.image_urls);
                    }
                }
            } catch (err: any) {
                console.error(err);
                Alert.alert("Error", "No pudimos cargar la información del anuncio.");
                router.back();
            } finally {
                setInitialLoading(false);
            }
        }

        fetchListing();
    }, [user, id, isLoading]);

    if (isLoading || initialLoading) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
            </SafeAreaView>
        );
    }

    if (!session || !user) {
        router.push('/(tabs)/');
        return null;
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

        for (let i = 0; i < images.length; i++) {
            const base64Img = images[i];

            // Si la imagen ya es una URL pública que estaba guardada, la mantenemos
            if (base64Img.startsWith('http')) {
                urls.push(base64Img);
                continue;
            }

            // Si es base64, necesitamos subirla de nuevo
            if (base64Img.startsWith('data:image')) {
                const base64Str = base64Img.split(',')[1];
                const fileName = `${user.id}-${Date.now()}-${i}.jpg`;

                const { data, error } = await supabase.storage
                    .from('listings')
                    .upload(fileName, decode(base64Str), {
                        contentType: 'image/jpeg',
                    });

                if (error) {
                    console.error("Upload error", error);
                    continue;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('listings')
                    .getPublicUrl(fileName);

                if (publicUrlData) {
                    urls.push(publicUrlData.publicUrl);
                }
            }
        }

        return urls;
    };

    const handleSave = async () => {
        if (!title || !description || !price || !locationId || !categoryId) {
            Alert.alert('Faltan datos', 'Por favor, rellena todos los campos obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrls = await uploadImages();

            // Guardar el telefono si hay uno nuevo
            if (phone && phone.trim().length > 0) {
                await supabase.from('users').update({ phone: phone.trim() }).eq('id', user.id);
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

            const { error } = await supabase
                .from('listings')
                .update({
                    title,
                    description,
                    price: parseFloat(price.replace(',', '.')),
                    price_type: priceType,
                    location: fullLocationString,
                    province_id: provinceNumericId,
                    municipality_id: municipality?.id || null,
                    image_urls: imageUrls,
                    category: finalCategory,
                    subcategory: finalSubcategory,
                    contact_phone: phone,
                    // Note: intentionally not touching 'status' or 'sold_price' here
                })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
                router.back();
            }, 2000);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al guardar el anuncio');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <View className="flex-1 items-center justify-center bg-surface px-6">
                <CheckCircle2 className="text-primary mb-4" size={64} />
                <Text className="text-2xl font-bold text-text mb-2 text-center">¡Anuncio actualizado!</Text>
                <Text className="text-text-muted text-center">Tus cambios se han guardado correctamente.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Modificar Anuncio</Text>
            </View>

            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-text mb-2">Fotos del producto</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {images.map((uri, index) => (
                            <View key={index} className="relative w-24 h-24 rounded-xl overflow-hidden mr-3 border border-gray-200">
                                <Image source={{ uri }} className="w-full h-full" contentFit="cover" />
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

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-text mb-2">Título del anuncio *</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Ej. Tractor John Deere 5090M"
                            className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    <View>
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

                    <View>
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

                    <View className="flex-row space-x-3">
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

                    <View>
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

                    <View>
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

                    <View>
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
                    onPress={handleSave}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-full items-center justify-center mt-8 mb-8 ${isSubmitting ? 'bg-primary-hover opacity-70' : 'bg-primary'
                        }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
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
