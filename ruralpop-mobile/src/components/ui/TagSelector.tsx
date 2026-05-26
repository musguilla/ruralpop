import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Tag, X, Search, Check } from 'lucide-react-native';
import { PREDEFINED_TAGS } from '../../constants/predefinedTags';

interface TagSelectorProps {
    category: string | null;
    subcategory: string | null;
    initialTags?: string[];
    onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ category, subcategory, initialTags = [], onTagsChange }: TagSelectorProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
    const [searchTerm, setSearchTerm] = useState("");

    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
        setSelectedTags([]);
        setSearchTerm("");
        onTagsChange([]);
    }, [category, subcategory]);

    const availableTags = useMemo(() => {
        if (!category) return [];
        
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const subKeyNormalized = subcategory ? normalize(subcategory) : '';
        const catKeyNormalized = normalize(category);

        let list: string[] = [];

        for (const key of Object.keys(PREDEFINED_TAGS)) {
            const keyNormalized = normalize(key);
            if ((subKeyNormalized && keyNormalized === subKeyNormalized) || keyNormalized === catKeyNormalized) {
                list = PREDEFINED_TAGS[key as keyof typeof PREDEFINED_TAGS];
                break;
            }
        }
        
        if (list.length === 0 && PREDEFINED_TAGS["otros"]) {
            list = PREDEFINED_TAGS["otros"];
        }
        
        return list;
    }, [category, subcategory]);

    const filteredTags = useMemo(() => {
        if (!category) return [];
        if (!availableTags) return [];
        return availableTags.filter(t => 
            !selectedTags.includes(t) && 
            t.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTags, selectedTags, searchTerm, category]);

    const suggestedTags = filteredTags.slice(0, 11);

    const toggleTag = (tag: string) => {
        let newTags;
        if (selectedTags.includes(tag)) {
            newTags = selectedTags.filter(t => t !== tag);
        } else {
            if (selectedTags.length >= 10) return;
            newTags = [...selectedTags, tag];
            setSearchTerm("");
        }
        setSelectedTags(newTags);
        onTagsChange(newTags);
    };

    return (
        <View className="space-y-4">
            <View className="flex-row items-center mb-2">
                <Tag color="#059669" size={16} />
                <Text className="text-sm font-bold text-text ml-2">Etiquetas</Text>
                <Text className="text-xs text-text-muted font-normal ml-2">
                    (Máx 10)
                </Text>
            </View>

            {/* Buscador de etiquetas */}
            <View className="relative mb-3">
                <View className="absolute inset-y-0 left-0 pl-3 flex justify-center z-10 pointer-events-none">
                    <Search color="#9ca3af" size={18} style={{ marginTop: 14 }} />
                </View>
                <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder={category ? "Busca etiquetas..." : "Selecciona una categoría primero"}
                    editable={!!category}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-surface-muted text-text"
                />
            </View>

            {/* Etiquetas sugeridas */}
            {suggestedTags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-2">
                    {suggestedTags.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => toggleTag(tag)}
                            className="flex-row items-center px-3 py-1.5 rounded-full bg-gray-100 border border-transparent mr-2 mb-2"
                        >
                            <Text className="text-sm font-medium text-gray-700">{tag}</Text>
                        </TouchableOpacity>
                    ))}
                    {filteredTags.length > 11 && (
                        <View className="px-2 py-1.5 justify-center mr-2 mb-2">
                            <Text className="text-sm text-gray-400">+{filteredTags.length - 11} más...</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Etiquetas Seleccionadas */}
            {selectedTags.length > 0 && (
                <View className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-2">
                    <View className="flex-row items-center mb-3">
                        <Check color="#059669" size={14} />
                        <Text className="text-xs font-bold uppercase tracking-wider text-primary ml-1">
                            Etiquetas elegidas ({selectedTags.length}/10)
                        </Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => toggleTag(tag)}
                                className="flex-row items-center px-3 py-1.5 rounded-full bg-primary mr-2 mb-2 shadow-sm"
                            >
                                <Text className="text-sm font-bold text-white mr-1.5">{tag}</Text>
                                <X color="white" size={14} style={{ opacity: 0.8 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}
