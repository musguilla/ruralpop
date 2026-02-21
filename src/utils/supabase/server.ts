import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crea un mock ultra-robusto que no bloquea el build de Next.js.
 * Debe ser 'Thenable' y 'Callable' recursivamente.
 */
function createBuildSafeProxy(): any {
    const noop = () => createBuildSafeProxy();
    return new Proxy(noop, {
        get: (target, prop) => {
            if (prop === 'auth') {
                return {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                };
            }
            if (prop === 'then') {
                // Crucial: Si Next.js hace 'await', resolvemos la promesa inmediatamente
                return (resolve: any) => resolve({ data: null, error: null, count: 0 });
            }
            // Para cualquier otra propiedad (from, select, eq...), devolvemos el mismo proxy recursivo
            return createBuildSafeProxy();
        },
        apply: () => {
            // Si el proxy se llama como función (ej: from('table')), devolvemos el mismo proxy
            return createBuildSafeProxy();
        }
    });
}

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Si estamos en fase de build o faltan variables, devolvemos el Proxy blindado
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length < 10) {
        return createBuildSafeProxy();
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
        // Fallback para fallos en cookies() durante generación estética
        return createBuildSafeProxy();
    }
}

/**
 * Memory / Decisiones Técnicas:
 * - El Proxy blindado soluciona el TIMEOUT de Vercel. 
 * - El error anterior se debía a que 'await' sobre un Proxy sin un 'then' que llame a 'resolve'
 *   dejaba la promesa pendiente indefinidamente, bloqueando el build worker.
 */
