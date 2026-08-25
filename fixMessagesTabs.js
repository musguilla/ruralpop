const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/(tabs)/messages.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
    /import \{ useAuth \} from '\.\.\/\.\.\/src\/contexts\/AuthContext';/,
    `import { useAuth } from '../../src/contexts/AuthContext';\nimport { useUnread } from '../../src/contexts/UnreadContext';`
);

// Call useUnread
content = content.replace(
    /const \{ session, user, isLoading \} = useAuth\(\);/,
    `const { session, user, isLoading } = useAuth();\n    const { unreadMessages, unreadNotifications } = useUnread();`
);

// Update Mensajes Tab
const mensajesRegex = /Mensajes\s*<\/Text>\s*<\/TouchableOpacity>/;
const mensajesReplacement = `Mensajes
                            {unreadMessages > 0 && (
                                <View className="bg-red-500 rounded-full h-5 min-w-[20px] px-1.5 ml-1.5 items-center justify-center">
                                    <Text className="text-white text-[11px] font-bold">{unreadMessages}</Text>
                                </View>
                            )}
                        </Text>
                    </TouchableOpacity>`;
content = content.replace(mensajesRegex, mensajesReplacement);

// Update Notificaciones Tab
const notificacionesRegex = /Notificaciones\s*<\/Text>\s*<\/TouchableOpacity>/;
const notificacionesReplacement = `Notificaciones
                            {unreadNotifications > 0 && (
                                <View className="bg-red-500 rounded-full h-5 min-w-[20px] px-1.5 ml-1.5 items-center justify-center">
                                    <Text className="text-white text-[11px] font-bold">{unreadNotifications}</Text>
                                </View>
                            )}
                        </Text>
                    </TouchableOpacity>`;
content = content.replace(notificacionesRegex, notificacionesReplacement);

fs.writeFileSync(file, content);
