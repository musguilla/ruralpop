import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Cliente simple para ser usado exclusivamente dentro de componentes con 'use client'.
 * - Next.js inyecta de forma segura los env vars que inician con NEXT_PUBLIC_ en el cliente.
 */
