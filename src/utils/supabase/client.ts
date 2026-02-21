import { createBrowserClient } from "@supabase/ssr";

function createBuildSafeProxy(): any {
    const noop = () => createBuildSafeProxy();
    return new Proxy(noop, {
        get: (target, prop) => {
            if (prop === 'auth') {
                return {
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                };
            }
            if (prop === 'then') {
                return (resolve: any) => resolve({ data: null, error: null });
            }
            return createBuildSafeProxy();
        },
        apply: () => {
            return createBuildSafeProxy();
        }
    });
}

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length < 10) {
        return createBuildSafeProxy();
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Implementación simétrica del Proxy blindado para el cliente.
 * - Evita 'hangs' durante el pre-renderizado de componentes de cliente en el servidor.
 */
