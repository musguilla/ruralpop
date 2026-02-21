import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length < 10) {
        // Build-safe check to prevent crashes during pre-rendering
        const mockHandler = {
            get: (target: any, prop: string): any => {
                if (prop === 'auth') {
                    return {
                        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    };
                }
                const fn = () => new Proxy({}, mockHandler);
                fn.then = (resolve: any) => resolve({ data: null, error: null });
                return fn;
            }
        };
        return new Proxy({}, mockHandler) as any;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Cliente simple para ser usado exclusivamente dentro de componentes con 'use client'.
 * - Next.js inyecta de forma segura los env vars que inician con NEXT_PUBLIC_ en el cliente.
 * - Incluye mock robusto para fase de build.
 */
