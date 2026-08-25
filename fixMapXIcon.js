const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/anuncio/[id].tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<SafeAreaView style=\{\{ position: 'absolute', top: 0, left: 0, right: 0 \}\} pointerEvents="box-none">[\s\S]*?<TouchableOpacity[\s\S]*?className="m-4 w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"[\s\S]*?style=\{\{ elevation: 5, shadowColor: '#000', shadowOffset: \{ width: 0, height: 2 \}, shadowOpacity: 0\.25, shadowRadius: 3\.84 \}\}>/;

const replacement = `<View style={{ position: 'absolute', top: Math.max(insets.top, 24) + 10, left: 20 }} pointerEvents="box-none">
                        <TouchableOpacity 
                            onPress={() => setIsMapModalVisible(false)}
                            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"
                            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}`;

// Note: I also have to replace the closing </SafeAreaView> with </View>
// Wait, I'll just replace the whole block to be safe.

const fullRegex = /<SafeAreaView style=\{\{ position: 'absolute', top: 0, left: 0, right: 0 \}\} pointerEvents="box-none">[\s\n]*<TouchableOpacity[\s\n]*onPress=\{\(\) => setIsMapModalVisible\(false\)\}[\s\n]*className="m-4 w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"[\s\n]*style=\{\{ elevation: 5, shadowColor: '#000', shadowOffset: \{ width: 0, height: 2 \}, shadowOpacity: 0\.25, shadowRadius: 3\.84 \}\}[\s\n]*>[\s\n]*<X color="#374151" size=\{24\} \/>[\s\n]*<\/TouchableOpacity>[\s\n]*<\/SafeAreaView>/;

const fullReplacement = `<View style={{ position: 'absolute', top: Math.max(insets.top, 40), left: 16 }} pointerEvents="box-none">
                        <TouchableOpacity 
                            onPress={() => setIsMapModalVisible(false)}
                            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md"
                            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                        >
                            <X color="#374151" size={24} />
                        </TouchableOpacity>
                    </View>`;

content = content.replace(fullRegex, fullReplacement);
fs.writeFileSync(file, content);
