import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { X, Check, Search, MapPin } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

interface Municipality {
    id: number;
    name: string;
}

interface MunicipalityModalProps {
    visible: boolean;
    onClose: () => void;
    provinceId: string | number | null;
    selectedMunicipality: Municipality | null;
    onSelect: (municipality: Municipality | null) => void;
}

export function MunicipalityModal({ visible, onClose, provinceId, selectedMunicipality, onSelect }: MunicipalityModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible || !provinceId) return;

        async function fetchMunicipalities() {
            setLoading(true);
            const { data, error } = await supabase
                .from("municipalities")
                .select("id, name")
                .eq("province_id", parseInt(provinceId as string, 10))
                .order("name");

            if (!error && data) {
                setMunicipalities(data);
            }
            setLoading(false);
        }

        fetchMunicipalities();
    }, [visible, provinceId]);

    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const activeList = useMemo(() => {
        const query = normalizeStr(searchQuery);
        return municipalities.filter((mun) => normalizeStr(mun.name).includes(query));
    }, [searchQuery, municipalities]);

    const handleSelect = (mun: Municipality | null) => {
        onSelect(mun);
        onClose();
        setTimeout(() => setSearchQuery(''), 300);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setSearchQuery(''), 300);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white pt-2">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-text">Localidad</Text>
                    <TouchableOpacity onPress={handleClose} className="p-2 -mr-2 bg-gray-50 rounded-full">
                        <X color="#6b7280" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 pt-4 pb-6 border-b border-gray-100">
                    <View className="flex-row items-center bg-white border border-gray-300 focus:border-primary rounded-xl h-12 px-4">
                        <Search color="#10b981" size={20} />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-800"
                            style={{ paddingVertical: 0 }}
                            placeholder="Buscar localidad..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color="#059669" size="large" />
                        <Text className="text-gray-500 mt-4">Cargando localidades...</Text>
                    </View>
                ) : (
                    <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                        {/* Cualquier localidad */}
                        {(!searchQuery || "cualquier localidad".includes(searchQuery.toLowerCase())) && (
                            <TouchableOpacity
                                onPress={() => handleSelect(null)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border mb-6 ${!selectedMunicipality ? 'bg-primary-muted/20 border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${!selectedMunicipality ? 'bg-primary-muted/50' : 'bg-gray-100'}`}>
                                        <MapPin color={!selectedMunicipality ? "#059669" : "#6b7280"} size={22} />
                                    </View>
                                    <Text className={`text-base font-bold ${!selectedMunicipality ? 'text-primary' : 'text-text'}`}>
                                        Cualquier localidad
                                    </Text>
                                </View>
                                {!selectedMunicipality && <Check color="#059669" size={24} />}
                            </TouchableOpacity>
                        )}

                        {activeList.map((mun, index, array) => {
                            const isSelected = selectedMunicipality?.id === mun.id;
                            const isLast = index === array.length - 1;

                            return (
                                <TouchableOpacity
                                    key={mun.id}
                                    onPress={() => handleSelect(mun)}
                                    className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className={`text-[17px] ${isSelected ? 'font-bold text-primary' : 'text-gray-800'}`}>
                                            {mun.name}
                                        </Text>
                                    </View>
                                    {isSelected && <Check color="#059669" size={24} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
}
