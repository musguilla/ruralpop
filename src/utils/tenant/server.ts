import { headers } from "next/headers";
import { getTenantFilterString } from "@/config/tenants";

/**
 * Devuelve el filtro PostgREST para el tenant actual en Server Components.
 * Extrae el tenant del middleware mediante el header 'x-tenant'.
 * Si no está, hace fallback a la variable de entorno base de Ruralpop.
 */
export async function getServerTenantFilterString(): Promise<string> {
    const activeTenant = await getServerTenantSlug();
    if (!activeTenant) return 'tenant_id.is.null';
    return getTenantFilterString(activeTenant);
}

/**
 * Devuelve el slug identificador del tenant actual (ej. 'equipop' o 'ruralpop')
 * Ideal para rendering condicional en Server Components.
 */
export async function getServerTenantSlug(): Promise<string | null> {
    const headersList = await headers();
    
    // 1. Check explicitly set middleware header
    const headerTenant = headersList.get('x-tenant');
    if (headerTenant) return headerTenant;

    // 2. Check host header directly (solves Next.js soft navigation /_next/data missing x-tenant)
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
    if (host.includes('equipop')) {
        return 'equipop';
    }

    // 3. Fallback to env var (returns a UUID, not a slug, but config handles it)
    const envTenant = process.env.NEXT_PUBLIC_RURALPOP_TENANT_ID;
    return envTenant || null;
}

/**
 * Devuelve el dominio base absoluto del tenant actual (ej. 'https://www.equipop.app' o 'https://www.ruralpop.com')
 * para su uso en canonicals, OpenGraph, hreflang y enlaces para compartir en redes sociales y navegadores móviles.
 * Prioriza el host real recibido en headers si pertenece al dominio del tenant (ej. 'equipop.app' o 'www.equipop.app').
 */
export async function getServerTenantDomain(): Promise<string> {
    const headersList = await headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
    const activeTenant = await getServerTenantSlug();
    const isEquipop = activeTenant === 'equipop' || host.includes('equipop');

    if (isEquipop) {
        if (host.includes('equipop.app')) {
            return `https://${host}`;
        }
        return process.env.NEXT_PUBLIC_EQUIPOP_URL || 'https://www.equipop.app';
    }

    if (host.includes('ruralpop.com')) {
        return `https://${host}`;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
}

