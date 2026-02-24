import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Key, Camera, X, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';
import { decode } from 'base64-arraybuffer';

export default function PublishScreen() {
    const { session, user, isLoading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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
                    className="bg-primary px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setImages([...images, `data:image/jpeg;base64,${asset.base64}`]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = [];

        for (let i = 0; i < images.length; i++) {
            const base64Img = images[i];
            if (base64Img.startsWith('data:image')) {
                const base64Str = base64Img.split(',')[1];
                const fileName = `${user?.id}-${Date.now()}-${i}.jpg`;

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
            } else {
                urls.push(base64Img);
            }
        }

        return urls;
    };

    const handlePublish = async () => {
        if (!title || !description || !price || !location) {
            Alert.alert('Faltan datos', 'Por favor, rellena todos los campos obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrls = await uploadImages();

            const { data, error } = await supabase
                .from('listings')
                .insert({
                    title,
                    description,
                    price: parseFloat(price),
                    location,
                    seller_id: user?.id,
                    image_urls: imageUrls,
                    category: 'bovino', // Defaulting to bovino for this demo
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
                setLocation('');
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
                                <Image source={{ uri }} className="w-full h-full" />
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
                        <Text className="text-sm font-bold text-text mb-2">Descripción *</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe el estado, año, características..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="w-full h-32 bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                        />
                    </View>

                    <View className="flex-row space-x-4">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-text mb-2">Precio (€) *</Text>
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0"
                                keyboardType="numeric"
                                className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text font-bold text-lg"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-text mb-2">Ubicación *</Text>
                            <TextInput
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Ej. Asturias"
                                className="w-full bg-surface-muted border border-gray-200 rounded-xl px-4 py-3 text-text"
                            />
                        </View>
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
        </SafeAreaView>
    );
}
