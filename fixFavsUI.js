const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/(tabs)/favorites.tsx');
let content = fs.readFileSync(file, 'utf8');

// Insert Tabs right after the title view
content = content.replace(
    /<Text className="text-2xl font-extrabold text-text">Favoritos<\/Text>\s*<\/View>/,
    `<Text className="text-2xl font-extrabold text-text">Favoritos</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row px-4 mb-4 mt-2">
                <TouchableOpacity
                    onPress={() => setActiveTab('products')}
                    className={\`mr-4 px-4 py-2 rounded-full \${activeTab === 'products' ? 'bg-[#1f2937]' : 'bg-transparent'}\`}
                >
                    <Text className={\`font-bold \${activeTab === 'products' ? 'text-white' : 'text-gray-600'}\`}>Productos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('profiles')}
                    className={\`px-4 py-2 rounded-full \${activeTab === 'profiles' ? 'bg-[#1f2937]' : 'bg-transparent'}\`}
                >
                    <Text className={\`font-bold \${activeTab === 'profiles' ? 'text-white' : 'text-gray-600'}\`}>Perfiles</Text>
                </TouchableOpacity>
            </View>`
);

// Replace FlatList with conditional rendering
content = content.replace(
    /<FlatList[\s\S]*?refreshing=\{refreshing\}[\s\S]*?onRefresh=\{onRefresh\}[\s\S]*?\/>/,
    `{activeTab === 'products' ? (
                <FlatList
                    data={rows}
                    keyExtractor={(item) => \`row-\${item[0].id}\`}
                    renderItem={({ item }) => (
                        <View className="flex-row" style={{ width: '100%' }}>
                            {item.map((listing: Listing) => (
                                <View key={listing.id} className="p-1" style={{ width: \`\${100 / numColumns}%\` }}>
                                    <ListingCard listing={listing} isSingleColumn={false} />
                                </View>
                            ))}
                            {Array.from({ length: numColumns - item.length }).map((_, i) => (
                                <View key={\`empty-\${i}\`} style={{ width: \`\${100 / numColumns}%\` }} />
                            ))}
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View className="items-center justify-center p-12 mt-10">
                                <Heart color="#d1d5db" style={{ marginBottom: 16 }} size={48} />
                                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">Sin favoritos</Text>
                                <Text className="text-gray-500 text-center">Los anuncios que guardes aparecerán aquí.</Text>
                            </View>
                        ) : null
                    }
                />
            ) : (
                <FlatList
                    data={profilesData}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
                    renderItem={({ item }) => (
                        <View style={{ width: '48.5%' }}>
                            <FavoriteProfileCard 
                                profile={item} 
                                listings={profilesListings[item.id] || []} 
                                onPress={() => router.push(\`/user/\${item.id}\`)} 
                            />
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                    }
                    ListEmptyComponent={
                        !loadingProfiles ? (
                            <View className="items-center justify-center p-12 mt-10">
                                <Heart color="#d1d5db" style={{ marginBottom: 16 }} size={48} />
                                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">Sin perfiles favoritos</Text>
                                <Text className="text-gray-500 text-center">Los vendedores que guardes aparecerán aquí.</Text>
                            </View>
                        ) : null
                    }
                />
            )}`
);

fs.writeFileSync(file, content);
