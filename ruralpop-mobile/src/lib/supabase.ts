import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing!');
}

const PRIMARY_STORAGE_KEY = '@ruralpop_session_v2';
const LEGACY_STORAGE_KEYS = [
    'sb-zrpucbuvojskcwrhwevv-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
];

/**
 * Adaptador de almacenamiento robusto con migración transparente:
 * 1. Clave unificada `@ruralpop_session_v2` para máxima persistencia y evitar deslogueos.
 * 2. Si un usuario ya tenía sesión activa en versiones anteriores, lee de las claves legacy
 *    de Supabase y la traslada a la nueva clave sin cerrar la sesión.
 */
const robustAuthStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                return value;
            }

            // Si es la clave principal y aún no está poblada, comprobar claves anteriores
            if (key === PRIMARY_STORAGE_KEY) {
                for (const legacyKey of LEGACY_STORAGE_KEYS) {
                    const legacyValue = await AsyncStorage.getItem(legacyKey);
                    if (legacyValue) {
                        await AsyncStorage.setItem(PRIMARY_STORAGE_KEY, legacyValue);
                        return legacyValue;
                    }
                }
            }

            return null;
        } catch (error) {
            console.warn('Error reading auth session from storage:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving auth session to storage:', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
            if (key === PRIMARY_STORAGE_KEY) {
                for (const legacyKey of LEGACY_STORAGE_KEYS) {
                    await AsyncStorage.removeItem(legacyKey).catch(() => {});
                }
            }
        } catch (error) {
            console.error('Error removing auth session from storage:', error);
        }
    },
};

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
        storageKey: PRIMARY_STORAGE_KEY,
        storage: robustAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});

/**
 * Memory / Decisiones Técnicas:
 * - Persistencia de StorageKey: Fijamos una clave primaria identificable (@ruralpop_session_v2)
 *   en lugar de depender del hash dinámico generado por la URL de Supabase.
 * - Migración Inadvertida: Para que ningún usuario pierda su sesión previa tras la actualización,
 *   inspeccionamos las claves anteriores de Supabase (sb-zrpucbuvojskcwrhwevv-auth-token) y
 *   copiamos la sesión al nuevo slot de forma transparente.
 */
