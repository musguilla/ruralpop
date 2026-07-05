import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing!');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    global: {
        fetch: (url, options) => {
            if (typeof url === 'string') {
                // Fix for React Native / URLSearchParams double encoding bugs
                const fixedUrl = url
                    .replace(/%252C/g, '%2C')
                    .replace(/%2525/g, '%25')
                    .replace(/%257B/g, '%7B')
                    .replace(/%257D/g, '%7D');
                return fetch(fixedUrl, options);
            }
            return fetch(url, options);
        }
    }
});
