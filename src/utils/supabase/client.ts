import { createBrowserClient } from "@supabase/ssr";

function createQueryProxy(): any {
    const noop = () => createQueryProxy();
    return new Proxy(noop, {
        get: (target, prop) => {
            if (prop === 'then') {
                return (resolve: any) => resolve({ data: null, error: null });
            }
            return createQueryProxy();
        },
        apply: () => createQueryProxy()
    });
}

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
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
    }
};

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length < 10) {
        return buildSafeClient as any;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    );
}
