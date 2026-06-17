import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createPublicClient } from "@supabase/supabase-js";

/**
 * Crea un mock ultra-robusto para las consultas (chains) de Supabase.
 * Es 'Thenable' para que los 'await' no se bloqueen.
 */
function createQueryProxy(): any {
    const noop = () => createQueryProxy();
    return new Proxy(noop, {
        get: (target, prop) => {
            if (prop === 'then') {
                return (resolve: any) => resolve({ data: null, error: null, count: 0 });
            }
            return createQueryProxy();
        },
        apply: () => createQueryProxy()
    });
}

/**
 * Cliente mock blindado. Al ser un objeto plano (no Proxy), 
 * 'await createClient()' devuelve el objeto correctamente sin intentar unwrapearlo.
 */
const buildSafeClient = {
    auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: () => createQueryProxy(),
    rpc: () => createQueryProxy(),
    storage: {
        from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            download: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
    }
};

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Si falta configuración, devolvemos el mock plano
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length < 10) {
        return buildSafeClient as any;
    }

    try {
        const cookieStore = await cookies();
        return createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Safe catch para contextos de solo lectura
                        }
                    },
                },
            }
        );
    } catch (e) {
        // En generación estática (build) de Next.js, cookies() lanza error.
        // En lugar de devolver un mock que causa 404s cacheados, 
        // devolvemos un cliente público funcional para leer datos estáticos.
        return createPublicClient(supabaseUrl, supabaseAnonKey);
    }
}
