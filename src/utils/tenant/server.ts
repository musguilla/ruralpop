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
    const headerTenant = headersList.get('x-tenant');
    const envTenant = process.env.NEXT_PUBLIC_RURALPOP_TENANT_ID;
    
    return headerTenant || envTenant || null;
}
