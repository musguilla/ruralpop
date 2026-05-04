import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
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
    const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
    const [soldModalVisible, setSoldModalVisible] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [soldPriceInput, setSoldPriceInput] = useState("");

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
        if (currentStatus === 'active') {
            // Open modal to request price
            setSelectedListingId(id);
            setSoldPriceInput("");
            setSoldModalVisible(true);
        } else {
            // Reactivate
            const { error } = await supabase
                .from('listings')
                .update({ status: 'active', sold_price: null })
                .eq('id', id);

            if (error) {
                Alert.alert("Error", error.message);
            } else {
                setListings(listings.map(l => l.id === id ? { ...l, status: 'active', sold_price: null } : l));
            }
        }
    };

    const submitSoldPrice = async () => {
        if (!selectedListingId) return;

        const numericPrice = parseFloat(soldPriceInput.replace(',', '.'));
        const finalPrice = isNaN(numericPrice) ? null : numericPrice;

        const { error } = await supabase
            .from('listings')
            .update({ status: 'sold', sold_price: finalPrice })
            .eq('id', selectedListingId);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setListings(listings.map(l => l.id === selectedListingId ? { ...l, status: 'sold', sold_price: finalPrice } : l));
            setSoldModalVisible(false);
            setSelectedListingId(null);
        }
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <View className="mb-6">
            <View className="w-full self-center">
                <ListingCard listing={item} />
            </View>

            <View className="flex-row justify-between items-center mt-3 px-1">
                <TouchableOpacity
                    onPress={() => handleMarkSold(item.id, item.status)}
                    className={`flex-row items-center px-4 py-2.5 rounded-2xl ${item.status === 'sold' ? 'bg-orange-50' : 'bg-primary-muted/30'}`}
                >
                    <CheckCircle color={item.status === 'sold' ? '#f97316' : '#059669'} size={18} />
                    <Text className={`ml-2 font-bold ${item.status === 'sold' ? 'text-orange-600' : 'text-primary'}`}>
                        {item.status === 'sold' ? 'Marcado Vendido' : 'Marcar Vendido'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        onPress={() => router.push(`/edit/${item.id}`)}
                        className="w-11 h-11 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm"
                    >
                        <Edit3 color="#6b7280" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        className="w-11 h-11 bg-red-50 rounded-full items-center justify-center border border-red-100 shadow-sm"
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

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 px-4 py-2">
                <TouchableOpacity
                    onPress={() => setActiveTab('active')}
                    className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'active' ? 'bg-primary/10' : ''}`}
                >
                    <Text className={`font-bold ${activeTab === 'active' ? 'text-primary' : 'text-gray-500'}`}>Activos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('sold')}
                    className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'sold' ? 'bg-orange-50' : ''}`}
                >
                    <Text className={`font-bold ${activeTab === 'sold' ? 'text-orange-600' : 'text-gray-500'}`}>Vendidos</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={listings.filter(l => activeTab === 'active' ? l.status !== 'sold' : l.status === 'sold')}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <PackageOpen className="text-gray-300 mb-4" size={64} />
                            <Text className="text-xl font-bold text-text mb-2">
                                {activeTab === 'active' ? 'Aún no has publicado nada' : 'Aún no has vendido nada'}
                            </Text>
                            <Text className="text-gray-500 text-center px-6 mb-8">
                                {activeTab === 'active'
                                    ? 'Anímate a subir tu primer anuncio. Es gratis y muy rápido.'
                                    : 'Tus anuncios marcados como vendidos aparecerán aquí.'}
                            </Text>
                            {activeTab === 'active' && (
                                <TouchableOpacity
                                    onPress={() => router.push('/(tabs)/publish')}
                                    className="bg-primary px-8 py-3 rounded-full"
                                >
                                    <Text className="text-white font-bold text-base">Publicar Anuncio</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* Sold Price Modal */}
            <Modal
                transparent={true}
                visible={soldModalVisible}
                animationType="fade"
                onRequestClose={() => setSoldModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
                        <Text className="text-xl font-bold text-text mb-2 text-center">¡Enhorabuena por la venta!</Text>
                        <Text className="text-gray-500 text-center mb-6 text-sm">
                            Este anuncio desaparecerá de las búsquedas. Para ayudarnos a analizar el mercado, ¿podrías indicarnos el precio final de venta?
                        </Text>

                        <View className="relative justify-center mb-6">
                            <TextInput
                                className="bg-surface-muted border border-gray-200 rounded-2xl px-4 py-4 pr-10 text-center text-2xl font-bold text-text"
                                placeholder="0"
                                keyboardType="numeric"
                                value={soldPriceInput}
                                onChangeText={setSoldPriceInput}
                            />
                            <Text className="absolute right-4 text-2xl font-bold text-gray-400">€</Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setSoldModalVisible(false)}
                                className="flex-1 py-3 items-center rounded-full bg-gray-100"
                            >
                                <Text className="font-bold text-gray-600">Omitir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitSoldPrice}
                                className="flex-1 py-3 items-center rounded-full bg-primary"
                            >
                                <Text className="font-bold text-white">Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
