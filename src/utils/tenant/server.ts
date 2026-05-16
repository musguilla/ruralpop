import { headers } from "next/headers";
import { getTenantFilterString } from "@/config/tenants";

/**
 * Devuelve el filtro PostgREST para el tenant actual en Server Components.
 * Extrae el tenant del middleware mediante el header 'x-tenant'.
 * Si no está, hace fallback a la variable de entorno base de Ruralpop.
 */
export async function getServerTenantFilterString(): Promise<string> {
    const headersList = await headers();
    const headerTenant = headersList.get('x-tenant');
    const envTenant = process.env.NEXT_PUBLIC_RURALPOP_TENANT_ID;
    
    const activeTenant = headerTenant || envTenant || null;
    
    if (!activeTenant) return 'tenant_id.is.null';
    return getTenantFilterString(activeTenant);
}
