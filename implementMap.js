const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/anuncio/[id].tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add import MapView, Circle
content = content.replace(
    /import \{ ScrollView \} from 'react-native';/,
    `import { ScrollView } from 'react-native';\nimport MapView, { Circle } from 'react-native-maps';`
);

// 2. Add state for mapCoords
content = content.replace(
    /const \[relatedListings, setRelatedListings\] = useState<Listing\[\]>\(\[\]\);/,
    `const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
    const [mapCoords, setMapCoords] = useState({ lat: 40.416775, lon: -3.703790, delta: 7.0 }); // Default Spain`
);

// 3. Add geocoding logic in useEffect
content = content.replace(
    /setListing\(data as ExtendedListing\);/,
    `setListing(data as ExtendedListing);
                
                // Geocode location
                if (data.location) {
                    const locStr = typeof data.location === 'object' ? (data.location as any).name : data.location;
                    if (locStr && locStr !== 'Toda España' && locStr.trim() !== '') {
                        fetch(\`https://nominatim.openstreetmap.org/search?q=\${encodeURIComponent(locStr + ', España')}&format=json&limit=1\`)
                            .then(res => res.json())
                            .then(json => {
                                if (json && json.length > 0) {
                                    setMapCoords({
                                        lat: parseFloat(json[0].lat),
                                        lon: parseFloat(json[0].lon),
                                        delta: 0.1
                                    });
                                }
                            })
                            .catch(e => console.log('Geocoding error', e));
                    }
                }`
);

// 4. Replace Mini Map
const miniMapRegex = /<TouchableOpacity[\s\S]*?onPress=\{\(\) => setIsMapModalVisible\(true\)\}[\s\S]*?className="w-full h-\[100px\] rounded-2xl overflow-hidden relative border border-gray-200"[\s\S]*?>\s*<Image[\s\S]*?source=\{require\('\.\.\/\.\.\/assets\/ruralpop\/map-placeholder\.jpg'\)\}[\s\S]*?\/>\s*<\/TouchableOpacity>/;

const miniMapReplacement = `<TouchableOpacity 
                            activeOpacity={0.9}
                            onPress={() => setIsMapModalVisible(true)}
                            className="w-full h-[120px] rounded-2xl overflow-hidden relative border border-gray-200 bg-gray-100"
                        >
                            <View pointerEvents="none" style={{ flex: 1 }}>
                                <MapView
                                    style={{ flex: 1 }}
                                    region={{
                                        latitude: mapCoords.lat,
                                        longitude: mapCoords.lon,
                                        latitudeDelta: mapCoords.delta,
                                        longitudeDelta: mapCoords.delta,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                >
                                    <Circle 
                                        center={{ latitude: mapCoords.lat, longitude: mapCoords.lon }} 
                                        radius={mapCoords.delta === 7.0 ? 200000 : 2000} 
                                        fillColor="rgba(16, 185, 129, 0.4)" 
                                        strokeColor="rgba(16, 185, 129, 0.8)" 
                                        strokeWidth={1} 
                                    />
                                </MapView>
                            </View>
                        </TouchableOpacity>`;
                        
content = content.replace(miniMapRegex, miniMapReplacement);

// 5. Replace Full Map Modal
const modalRegex = /\{\/\* Map Modal \*\/\}\s*<Modal[\s\S]*?transparent=\{false\}[\s\S]*?visible=\{isMapModalVisible\}[\s\S]*?animationType="slide"[\s\S]*?onRequestClose=\{\(\) => setIsMapModalVisible\(false\)\}\s*>\s*<SafeAreaView className="flex-1 bg-white">[\s\S]*?<\/SafeAreaView>\s*<\/Modal>/;

const modalReplacement = `{/* Map Modal */}
            <Modal
                transparent={false}
                visible={isMapModalVisible}
                animationType="slide"
                onRequestClose={() => setIsMapModalVisible(false)}
            >
                <View className="flex-1 bg-white">
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: mapCoords.lat,
                            longitude: mapCoords.lon,
                            latitudeDelta: mapCoords.delta === 7.0 ? 5.0 : 0.05,
                            longitudeDelta: mapCoords.delta === 7.0 ? 5.0 : 0.05,
                        }}
                        showsUserLocation={true}
                    >
                        <Circle 
                            center={{ latitude: mapCoords.lat, longitude: mapCoords.lon }} 
                            radius={mapCoords.delta === 7.0 ? 200000 : 2000} 
                            fillColor="rgba(16, 185, 129, 0.4)" 
                            strokeColor="rgba(16, 185, 129, 0.8)" 
                            strokeWidth={1.5} 
                        />
                    </MapView>
                    <SafeAreaView className="absolute top-0 left-0 right-0" pointerEvents="box-none">
                        <TouchableOpacity 
                            onPress={() => setIsMapModalVisible(false)}
                            className="m-4 w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"
                            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                        >
                            <X color="#374151" size={24} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </Modal>`;

content = content.replace(modalRegex, modalReplacement);

fs.writeFileSync(file, content);
