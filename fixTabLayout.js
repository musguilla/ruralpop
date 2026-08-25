const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/(tabs)/_layout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add useUnread import
content = content.replace(
    /import \{ useAuth \} from "\.\.\/\.\.\/src\/contexts\/AuthContext";/,
    `import { useAuth } from "../../src/contexts/AuthContext";\nimport { useUnread } from "../../src/contexts/UnreadContext";`
);

// Replace existing unread logic
const removeLogicRegex = /const \[hasUnread, setHasUnread\] = useState\(false\);[\s\S]*?return \(\s*<Tabs/;
const logicReplacement = `const { totalUnread } = useUnread();

    return (
        <Tabs`;

content = content.replace(removeLogicRegex, logicReplacement);

// Replace the icon rendering for MessageCircle
const iconRegex = /<MessageCircle color=\{color\} size=\{24\} \/>\s*\{hasUnread && \(\s*<View style=\{\{ position: 'absolute', top: -2, right: -4, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 1\.5, borderColor: '#ffffff' \}\} \/>\s*\)\}/;

const iconReplacement = `<MessageCircle color={color} size={24} />
                            {totalUnread > 0 && (
                                <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#ffffff', paddingHorizontal: 2 }}>
                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </Text>
                                </View>
                            )}`;

content = content.replace(iconRegex, iconReplacement);

fs.writeFileSync(file, content);
