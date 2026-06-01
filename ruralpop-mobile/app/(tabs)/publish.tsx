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
import { AnimalWelfareModal } from '../../src/components/ui/modals/AnimalWelfareModal';
import { FeaturedCheckoutMobile } from '../../src/components/upload/FeaturedCheckoutMobile';
import { TagSelector } from '../../src/components/ui/TagSelector';
import { getRuralpopDatabaseId } from '../../src/config/tenants';
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
    const [tags, setTags] = useState<string[]>([]);
    const [isProfesional, setIsProfesional] = useState(false);
    
    // Escrow / Venta Online
    const [isStripeReady, setIsStripeReady] = useState(false);
    const [allowOnlineSale, setAllowOnlineSale] = useState(false);
    const [shippingPrice, setShippingPrice] = useState('');

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);
    const [isAnimalWelfareModalOpen, setIsAnimalWelfareModalOpen] = useState(false);
    const [welfareListingId, setWelfareListingId] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPicking, setIsPicking] = useState(false);
    const [successListingId, setSuccessListingId] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            if (user?.id && session) {
                async function fetchData() {
                    // Fetch phone, role and location data
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('contact_phone, role, location, province_id, municipality_id')
                        .eq('id', user?.id)
                        .single();
                        
                    if (userData && !userError) {
                        if (userData.contact_phone) setPhone(userData.contact_phone);
                        setIsProfesional(userData.role === 'profesional');
                        if (userData.location) setLocationId(userData.location);
                        
                        if (userData.municipality_id) {
                            const { data: munData } = await supabase
                                .from('municipalities')
                                .select('name')
                                .eq('id', userData.municipality_id)
                                .single();
                                
                            if (munData) {
                                setMunicipality({ id: userData.municipality_id, name: munData.name });
                            }
                        }
                    }

                    // Fetch wallet status
                    const ruralpopDomain = 'https://www.ruralpop.com'; // or from env
                    try {
                        const res = await fetch(`${ruralpopDomain}/api/checkout/escrow/wallet-status`, {
                            headers: { Authorization: `Bearer ${session?.access_token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setIsStripeReady(data.isStripeReady);
                        }
                    } catch (e) {
                        console.error("Error fetching wallet status", e);
                    }
                }
                fetchData();
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
        if (isPicking) return;
        setIsPicking(true);
        try {
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
                    [{ resize: { width: 600 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP, base64: true }
                );

                if (manipResult.base64) {
                    setImages([...images, `data:image/webp;base64,${manipResult.base64}`]);
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
        } finally {
            setIsPicking(false);
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

        if (images.length === 0) {
            Alert.alert('Faltan imágenes', 'Es obligatorio subir al menos una foto para publicar tu anuncio.');
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrls = await uploadImages();

            const selectedProvinceObj = LOCATIONS.find(l => l.name === locationId);
            const provinceNumericId = selectedProvinceObj ? parseInt(selectedProvinceObj.id, 10) : null;
            const fullLocationString = municipality ? `${municipality.name}, ${locationId}` : locationId;

            // Guardar los datos de contacto y ubicación en el perfil del usuario si no los tiene
            try {
                const { data: currentUserData } = await supabase.from('users').select('location, municipality_id, contact_phone').eq('id', user?.id).single();
                const finalUpdate: any = {};
                
                if (!currentUserData?.contact_phone && phone && phone.trim().length > 0) {
                    finalUpdate.contact_phone = phone.trim();
                }
                if (!currentUserData?.location && locationId) {
                    finalUpdate.location = locationId;
                    finalUpdate.province_id = provinceNumericId;
                }
                if (!currentUserData?.municipality_id && municipality?.id) {
                    finalUpdate.municipality_id = municipality.id;
                }

                if (Object.keys(finalUpdate).length > 0) {
                    await supabase.from('users').update(finalUpdate).eq('id', user?.id);
                }
            } catch (e) {
                console.error("Error updating user profile with default location:", e);
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

            // [Antigravity Sync]: Animal Welfare Restriction Check (Igual que en la web)
            let isRestricted = false;
            if (finalSubcategory && finalSubcategory.toLowerCase() === "perros" && !isProfesional) {
                isRestricted = true;
            } else if (!isProfesional) {
                const restrictedKeywords = ["agaporni", "agapornis", "ninfa", "ninfas", "periquito", "periquitos", "cotorra", "cotorras", "canario", "canarios", "loro", "loros", "lorito", "loritos", "papillero", "papilleros", "papillera", "papilleras", "anillado", "anillados", "anillada", "anilladas", "paloma", "palomas", "palomo", "palomos", "gato", "gatos", "gata", "gatas", "perro", "perros", "cachorro", "cachorros", "perra", "mastin", "mastina", "jilguero", "jilgueros", "camachuelo", "camachuelos", "lugano", "luganos", "pardillo", "pardillos", "verdecillo", "verdecillos", "verderones comunes", "verderon", "serrano", "serranos", "pinzones reales", "pinzones comunes", "pinzon", "diamante gold", "isabelita", "isabelitas", "isabelita japon"];
                const combinedText = `${title.toLowerCase()} ${description.toLowerCase()} ${tags.join(" ").toLowerCase()}`;
                
                for (const word of restrictedKeywords) {
                    if (combinedText.includes(word)) {
                        isRestricted = true;
                        break;
                    }
                }
            }

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
                    status: isRestricted ? 'draft' : 'active',
                    shipping_price: allowOnlineSale && shippingPrice ? parseFloat(shippingPrice.replace(',', '.')) : 0,
                    tags: tags,
                    tenant_id: getRuralpopDatabaseId() || undefined
                })
                .select()
                .single();

            if (error) throw error;

            if (isRestricted) {
                setWelfareListingId(data.id);
                setIsAnimalWelfareModalOpen(true);
            } else {
                setSuccessListingId(data.id);
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al publicar el anuncio');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successListingId) {
        return (
            <FeaturedCheckoutMobile 
                listingId={successListingId}
                onSkip={() => {
                    setTitle('');
                    setDescription('');
                    setPrice('');
                    setLocationId(null);
                    setMunicipality(null);
                    setCategoryId(null);
                    setImages([]);
                    setTags([]);
                    setSuccessListingId(null);
                    router.push('/(tabs)/');
                }}
            />
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <View className="px-6 py-4 border-b border-gray-100 bg-white">
                <Text className="text-2xl font-extrabold text-text">Publicar Anuncio</Text>
            </View>

            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-text mb-2">Fotos del producto *</Text>
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

                    <View className="mb-6">
                        <TagSelector 
                            category={categoryId} 
                            subcategory={null} 
                            initialTags={tags} 
                            onTagsChange={setTags} 
                        />
                    </View>

                    <View className="flex-row mb-6">
                        <View className="flex-[0.8] mr-3">
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
                                    if (allowOnlineSale) {
                                        Alert.alert('Venta online', 'Al activar la venta online, el precio debe ser fijo.');
                                        return;
                                    }
                                    const idx = PRICE_TYPES.findIndex(p => p.id === priceType);
                                    const next = PRICE_TYPES[(idx + 1) % PRICE_TYPES.length];
                                    setPriceType(next.id);
                                }}
                                className={`w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center ${allowOnlineSale ? 'opacity-50' : ''}`}
                            >
                                <Text className="text-base text-text" numberOfLines={1}>
                                    {PRICE_TYPES.find(p => p.id === priceType)?.label || 'Precio Fijo'}
                                </Text>
                                <ChevronDown color="#9ca3af" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <View className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 pr-4">
                                    <Text className="text-sm font-bold text-text mb-1">Activar Venta Online Segura</Text>
                                    <Text className="text-xs text-text-muted">Permite a los usuarios comprar tu producto con pago seguro. Recibirás el dinero en tu monedero.</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        const nextVal = !allowOnlineSale;
                                        setAllowOnlineSale(nextVal);
                                        if (nextVal) {
                                            setPriceType('fixed');
                                        }
                                    }}
                                    className={`w-12 h-6 rounded-full justify-center px-1 ${allowOnlineSale ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <View className={`w-4 h-4 rounded-full bg-white transition-all ${allowOnlineSale ? 'ml-auto' : ''}`} />
                                </TouchableOpacity>
                            </View>

                            {allowOnlineSale && (
                                <View className="mt-4 pt-4 border-t border-emerald-200">
                                    <Text className="text-sm font-bold text-text mb-2">Gastos de envío (€) *</Text>
                                    <TextInput
                                        value={shippingPrice}
                                        onChangeText={setShippingPrice}
                                        placeholder="Ej: 4.99"
                                        keyboardType="numeric"
                                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-text"
                                    />
                                    <Text className="text-xs text-text-muted mt-2">
                                        Este importe se sumará al precio final que pagará el comprador.
                                    </Text>
                                </View>
                            )}
                        </View>
                        
                        {allowOnlineSale && !isStripeReady && (
                            <View className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl flex-row items-start space-x-3">
                                <Info className="text-amber-600 mt-0.5" size={20} />
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-amber-900 mb-2">
                                        Has activado la venta online pero aún no has configurado tu monedero para recibir los pagos.
                                    </Text>
                                    <TouchableOpacity onPress={() => router.push('/monedero')}>
                                        <Text className="text-sm font-bold text-primary">Configurar mi monedero →</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
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
                    disabled={isSubmitting || (allowOnlineSale && !isStripeReady)}
                    className={`w-full py-4 rounded-full items-center justify-center mt-8 mb-8 ${
                        isSubmitting 
                            ? 'bg-primary-hover opacity-70' 
                            : (allowOnlineSale && !isStripeReady)
                                ? 'bg-gray-300'
                                : 'bg-primary'
                    }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className={`font-bold text-lg ${allowOnlineSale && !isStripeReady && !isSubmitting ? 'text-gray-500' : 'text-white'}`}>Publicar Anuncio</Text>
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

            <AnimalWelfareModal 
                visible={isAnimalWelfareModalOpen}
                onClose={() => setIsAnimalWelfareModalOpen(false)}
                listingId={welfareListingId}
                onSuccess={() => {
                    setIsAnimalWelfareModalOpen(false);
                    setTimeout(() => {
                        setTitle('');
                        setDescription('');
                        setPrice('');
                        setLocationId(null);
                        setMunicipality(null);
                        setCategoryId(null);
                        setImages([]);
                        setTags([]);
                        router.push('/(tabs)/');
                    }, 2000);
                }}
            />
        </SafeAreaView>
    );
}
