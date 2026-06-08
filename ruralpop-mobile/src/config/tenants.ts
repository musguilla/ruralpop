/**
 * Configuración de Multi-Tenant para Ruralpop Mobile
 * 
 * Permite filtrar consultas a Supabase y taguear nuevas entidades (anuncios, mensajes)
 * con el ID de la vertical correspondiente (RURALPOP por defecto), garantizando el
 * aislamiento de datos respecto a futuras verticales (ej. Equipop) que operen en la misma DB.
 */

export const ACTIVE_TENANT_ID = process.env.EXPO_PUBLIC_TENANT_ID;
export const IS_EQUIPOP = ACTIVE_TENANT_ID === '69d55371-2f70-4e67-b55c-4502bce305bb';

/**
 * Devuelve el string de filtro para inyectar en llamadas Supabase .or()
 * Mantiene compatibilidad con listados antiguos (tenant_id.is.null)
 * 
 * Ejemplo de uso:
 * .from('listings').select('*').or(getDefaultTenantFilterString())
 */
export function getDefaultTenantFilterString(): string {
    const defaultId = ACTIVE_TENANT_ID || 'RURALPOP';
    if (defaultId === 'RURALPOP' || defaultId === 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9') {
        return `tenant_id.eq.${defaultId},tenant_id.is.null`;
    }
    return `tenant_id.eq.${defaultId}`;
}

/**
 * Devuelve el ID de tenant actual para insertar en nuevas entidades (anuncios, chats, etc.)
 */
export function getRuralpopDatabaseId(): string | undefined {
    return ACTIVE_TENANT_ID;
}
