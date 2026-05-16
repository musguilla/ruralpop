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
    slug: RURALPOP_TENANT_SLUG,
    name: 'Ruralpop',
    marketplaceMode: 'classifieds',
    escrowRequired: false,
    allowHandDeal: true,
  },
  [EQUIPOP_TENANT_SLUG]: {
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
