const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/anuncio/[id].tsx');
let content = fs.readFileSync(file, 'utf8');

const descRegex = /\{\/\* Description \*\/\}[\s\S]*?\{\/\* Ad Unit & Edited Date \*\/\}[\s\S]*?<\/View>\s*<\/View>/;

const newDesc = `{/* Description */}
                    <View className="mb-2">
                        <Text className="text-xl font-bold text-text mb-4">Descripción</Text>
                        <Text className="text-text-muted text-[17px] leading-relaxed mb-4">
                            {listing.description}
                        </Text>
                        
                        <Text className="text-gray-400 text-sm border-t border-gray-100 pt-3">
                            Editado el {new Date((listing as any).updated_at || listing.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    {/* Location Map */}
                    <View className="mb-8 mt-6">
                        <View className="flex-row items-center mb-3">
                            <MapPin color="#475569" size={24} className="mr-2" />
                            <Text className="text-xl font-bold text-[#475569]">
                                {listing.location ? (typeof listing.location === 'object' ? (listing.location as any).name : listing.location) : 'Toda España'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => setIsMapModalVisible(true)}
                            className="w-full h-[100px] rounded-2xl overflow-hidden relative border border-gray-200"
                        >
                            <Image 
                                source={require('../../assets/ruralpop/map-placeholder.jpg')} 
                                style={{ width: '100%', height: '100%' }} 
                                contentFit="cover" 
                            />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Related Listings */}
                    {relatedListings.length > 0 && (
                        <View className="mb-8 mt-4 pt-6 border-t border-gray-100">
                            <Text className="text-2xl font-extrabold text-text mb-4">Más como esto</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-4">
                                {relatedListings.map(item => (
                                    <View key={item.id} style={{ width: 160, marginRight: 12 }}>
                                        <ListingCard listing={item} isSingleColumn={true} />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Ad Unit */}
                    <View className="mt-4 mb-4">
                        <View className="w-full items-center justify-center bg-gray-50/50 mb-6 rounded-xl overflow-hidden">
                            <RectangularBanner />
                        </View>
                    </View>`;

content = content.replace(descRegex, newDesc);
fs.writeFileSync(file, content);
