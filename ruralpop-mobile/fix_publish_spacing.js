const fs = require('fs');
const file = 'app/(tabs)/publish.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace <View className="space-y-6"> with <View>
content = content.replace('<View className="space-y-6">', '<View>');

// We find the chunks that represent form fields and add mb-6 to their wrapper views.
// They usually look like:
// <View>
//     <Text className="text-sm font-bold text-text mb-2">
// We can replace exactly that pattern.
content = content.replaceAll(
    '<View>\n                        <Text className="text-sm font-bold text-text mb-2">',
    '<View className="mb-6">\n                        <Text className="text-sm font-bold text-text mb-2">'
);

// Specifically for the flex-row space-x-3 block
content = content.replace(
    '<View className="flex-row space-x-3">',
    '<View className="flex-row space-x-3 mb-6">'
);

fs.writeFileSync(file, content, 'utf8');
