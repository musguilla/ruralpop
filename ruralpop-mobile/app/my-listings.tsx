import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { Listing } from '../src/types';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2, Edit3, CheckCircle, PackageOpen } from 'lucide-react-native';
import { ListingCard } from '../src/components/ui/ListingCard';

export default function MyListingsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchMyListings() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching my listings', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyListings();
    }, [user]);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Anuncio",
            "¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('listings').delete().eq('id', id);
                        if (error) {
                            Alert.alert("Error", error.message);
                        } else {
                            setListings(listings.filter(l => l.id !== id));
                        }
                    }
                }
            ]
        );
    };

    const handleMarkSold = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
        const { error } = await supabase
            .from('listings')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
        }
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <View className="mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <View className="w-full max-w-[300px] self-center mb-4">
                <ListingCard listing={item} />
            </View>

            <View className="flex-row justify-between items-center border-t border-gray-100 pt-4 mt-2">
                <TouchableOpacity
                    onPress={() => handleMarkSold(item.id, item.status)}
                    className={`flex-row items-center px-4 py-2 rounded-xl ${item.status === 'sold' ? 'bg-orange-50' : 'bg-primary-muted/30'}`}
                >
                    <CheckCircle color={item.status === 'sold' ? '#f97316' : '#059669'} size={18} />
                    <Text className={`ml-2 font-bold ${item.status === 'sold' ? 'text-orange-600' : 'text-primary'}`}>
                        {item.status === 'sold' ? 'Marcado Vendido' : 'Marcar Vendido'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row space-x-3">
                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                        <Edit3 color="#6b7280" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                    >
                        <Trash2 color="#ef4444" size={18} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-surface-muted">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text ml-2">Mis Anuncios</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <PackageOpen className="text-gray-300 mb-4" size={64} />
                            <Text className="text-xl font-bold text-text mb-2">Aún no has publicado nada</Text>
                            <Text className="text-gray-500 text-center px-6 mb-8">
                                Anímate a subir tu primer anuncio. Es gratis y muy rápido.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/publish')}
                                className="bg-primary px-8 py-3 rounded-full"
                            >
                                <Text className="text-white font-bold text-base">Publicar Anuncio</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
