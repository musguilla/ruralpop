import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Tag, X, Search, Check } from 'lucide-react-native';
import { PREDEFINED_TAGS } from '../../constants/predefinedTags';
import { CATEGORIES } from '../../constants/categories';
import { IS_EQUIPOP } from '../../config/tenants';

interface TagSelectorProps {
    title?: string;
    category: string | null;
    subcategory: string | null;
    initialTags?: string[];
    onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ category, subcategory, title = "", initialTags = [], onTagsChange }: TagSelectorProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
    const [searchTerm, setSearchTerm] = useState("");

    const prevCatRef = React.useRef(category);
    const prevSubcatRef = React.useRef(subcategory);

    useEffect(() => {
        if (prevCatRef.current !== category || prevSubcatRef.current !== subcategory) {
            setSelectedTags([]);
            setSearchTerm("");
            onTagsChange([]);
            prevCatRef.current = category;
            prevSubcatRef.current = subcategory;
        }
    }, [category, subcategory]);

    const availableTags = useMemo(() => {
        if (!category) return [];
        
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        // 1. EXTRAER KEYWORDS DEL TÍTULO
        const STOP_WORDS = new Set([
            "de", "la", "el", "en", "para", "con", "por", "muy", "se", "un", "una", "unos", "unas",
            "año", "años", "mes", "meses", "vendo", "vende", "venta", "oportunidad", "ocasión", "ocasion",
            "compro", "busco", "cambio", "regalo", "gratis", "barato", "nuevo", "nueva", "buen", "estado"
        ]);
        
        let titleKeywords: string[] = [];
        if (title) {
            const cleanTitle = normalize(title).replace(/[.,;:!?()"']/g, ' ');
            const tokens = cleanTitle.split(/\s+/);
            
            for (const token of tokens) {
                if (token.length >= 3 && !STOP_WORDS.has(token) && !/^\d+$/.test(token)) {
                    if (!titleKeywords.includes(token)) {
                        titleKeywords.push(token);
                        if (titleKeywords.length >= 6) break;
                    }
                }
            }
        }

        // 2. BUSCAR EN CATEGORÍAS PREDEFINIDAS
        const subKeyNormalized = subcategory ? normalize(subcategory).replace(/-/g, ' ') : '';
        
        let effectiveCategory = category;
        if (IS_EQUIPOP && category) {
            const parent = CATEGORIES.find(c => c.subcategories?.includes(category));
            if (parent) {
                effectiveCategory = parent.id;
            }
        }

        const catKeyNormalized = normalize(effectiveCategory).replace(/-/g, ' ');

        let list: string[] = [];

        for (const key of Object.keys(PREDEFINED_TAGS)) {
            const keyNormalized = normalize(key);
            if ((subKeyNormalized && keyNormalized === subKeyNormalized) || keyNormalized === catKeyNormalized) {
                list = PREDEFINED_TAGS[key as keyof typeof PREDEFINED_TAGS];
                break;
            }
        }
        
        // 3. FUSIONAR KEYWORDS Y ETIQUETAS RELACIONADAS
        // Las keywords extraídas del título van primero.
        let finalTags = [...titleKeywords];
        
        // Luego añadimos las etiquetas de la categoría, y priorizamos las que hagan match con las keywords
        let matchedTags: string[] = [];
        let otherTags: string[] = [];
        
        for (const tag of list) {
            if (finalTags.includes(tag.toLowerCase())) continue; // ya está como keyword directa
            
            // Ver si hace match por raíz (ej. "burro" -> "burros", "burrito")
            let hasMatch = false;
            const normTag = normalize(tag);
            for (const kw of titleKeywords) {
                // Hacemos match simple si comparten los primeros 4 caracteres, o si uno incluye al otro
                const root = kw.length > 4 ? kw.substring(0, 4) : kw;
                if (normTag.includes(root) || normTag.includes(kw)) {
                    hasMatch = true;
                    break;
                }
            }
            
            if (hasMatch) {
                matchedTags.push(tag);
            } else {
                otherTags.push(tag);
            }
        }
        
        // Unimos: [Keywords exactas] + [Etiquetas que coinciden con keywords] + [Resto de etiquetas de la categoría]
        finalTags = [...finalTags, ...matchedTags, ...otherTags];
        
        return finalTags;
    }, [category, subcategory, title]);

    const filteredTags = useMemo(() => {
        if (!category) return [];
        if (!availableTags) return [];
        return availableTags.filter(t => 
            !selectedTags.includes(t) && 
            t.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTags, selectedTags, searchTerm, category]);

    const suggestedTags = filteredTags.slice(0, 3);

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
            <View className="mb-3">
                <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder={category ? "Busca etiquetas..." : "Selecciona una categoría primero"}
                    editable={!!category}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-surface-muted text-text"
                />
            </View>

            {/* Etiquetas sugeridas */}
            {suggestedTags.length > 0 && (
                <View className="flex-row w-full mb-2" style={{ gap: 8 }}>
                    {suggestedTags.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => toggleTag(tag)}
                            className="flex-1 items-center justify-center px-1 py-2.5 rounded-xl bg-gray-100 border border-transparent"
                        >
                            <Text className="text-[13px] font-medium text-gray-700 text-center" numberOfLines={2}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                    {filteredTags.length > 3 && (
                        <View className="justify-center pl-1 pr-2">
                            <Text className="text-xs text-gray-400">+{filteredTags.length - 3} más</Text>
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
