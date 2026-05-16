export type MarketplaceMode = 'classifieds' | 'escrow_only';

export interface TenantConfig {
  id?: string; // El UUID real de la base de datos (lo inyectaremos vía .env o fetch)
  slug: string;
  name: string;
  marketplaceMode: MarketplaceMode;
  escrowRequired: boolean;
  allowHandDeal: boolean;
}

export const RURALPOP_TENANT_SLUG = 'ruralpop';
export const EQUIPOP_TENANT_SLUG = 'equipop';

// Configuración estática que actúa como "fuente de verdad" rápida para la UI
export const TENANTS_CONFIG: Record<string, TenantConfig> = {
  [RURALPOP_TENANT_SLUG]: {
    id: 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9',
    slug: RURALPOP_TENANT_SLUG,
    name: 'Ruralpop',
    marketplaceMode: 'classifieds',
    escrowRequired: false,
    allowHandDeal: true,
  },
  [EQUIPOP_TENANT_SLUG]: {
    id: '69d55371-2f70-4e67-b55c-4502bce305bb',
    slug: EQUIPOP_TENANT_SLUG,
    name: 'Equipop',
    marketplaceMode: 'escrow_only',
    escrowRequired: true,
    allowHandDeal: false,
  },
};

/**
 * Obtiene la configuración de un tenant a partir de su slug.
 * Si no se encuentra, hace fallback al tenant por defecto.
 */
export const getTenantConfig = (slug: string): TenantConfig => {
  return TENANTS_CONFIG[slug] || getDefaultTenant();
};

export const getTenantBySlug = getTenantConfig; // Alias requerido en la especificación

/**
 * Devuelve el tenant por defecto (Ruralpop) para asegurar la retrocompatibilidad.
 */
export const getDefaultTenant = (): TenantConfig => {
  return TENANTS_CONFIG[RURALPOP_TENANT_SLUG];
};

/**
 * Helper: Comprueba si un tenant específico fuerza el uso de pagos seguros (Escrow).
 */
export const isEscrowRequired = (slug: string = RURALPOP_TENANT_SLUG): boolean => {
  return getTenantConfig(slug).escrowRequired;
};

/**
 * Helper: Comprueba si un tenant permite la opción de "Trato en mano".
 */
export const allowsHandDeal = (slug: string = RURALPOP_TENANT_SLUG): boolean => {
  return getTenantConfig(slug).allowHandDeal;
};

/**
 * Obtiene el UUID real de la base de datos para Ruralpop.
 * Esto lo añadiremos a tu .env.local para no hacer queries extra cada vez que alguien publique.
 */
export const getRuralpopDatabaseId = (): string | null => {
  return process.env.NEXT_PUBLIC_RURALPOP_TENANT_ID || null;
};

/**
 * Helper: Construye el string de filtro PostgREST para queries de Supabase.
 * Permite leer registros del tenant actual o legacy (null).
 * Convierte el slug (ej. 'equipop') en su UUID real para evitar errores de sintaxis en PostgREST.
 */
export const getTenantFilterString = (tenantSlugOrId: string): string => {
  // Si nos pasan el slug, sacamos el ID. Si ya es un ID (no coincide con slug), lo usamos directamente.
  const config = getTenantConfig(tenantSlugOrId);
  const uuid = config.id || tenantSlugOrId;
  return `tenant_id.eq.${uuid},tenant_id.is.null`;
};

/**
 * Helper: Construye el string de filtro para el tenant principal por defecto (Ruralpop).
 */
export const getDefaultTenantFilterString = (): string => {
  const defaultId = getRuralpopDatabaseId();
  if (!defaultId) return 'tenant_id.is.null'; // Fallback seguro si no hay env configurado
  return getTenantFilterString(defaultId);
};
