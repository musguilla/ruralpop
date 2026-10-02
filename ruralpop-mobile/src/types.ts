export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number | null;
    price_type: 'fixed' | 'negotiable' | 'exchange';
    location: string;
    image_urls?: string[];
    created_at: string;
    category: string;
    subcategory?: string;
    user_id: string;
    status: 'active' | 'sold' | 'draft';
    contact_phone?: string;
    is_featured?: boolean;
    vender_online?: boolean;
    shipping_price?: number;
    sold_price?: number | null;
    users?: {
        is_ghost?: boolean;
        role?: string;
    } | Array<{
        is_ghost?: boolean;
        role?: string;
    }>;
    seller?: User & {
        is_ghost?: boolean;
        zoo_register_number?: string;
    };
}

export interface User {
    id: string;
    name: string;
    avatar_url?: string;
    phone?: string;
    created_at?: string;
    role?: string;
    commercial_name?: string;
    is_ghost?: boolean;
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Type Safety estricto para estados de perfiles PRO / Ghost: Los anuncios de
 *      perfiles PRO solo deben ser visibles en Ruralpop y Equipop si el perfil está
 *      activado (is_ghost === false). Agregar 'is_ghost' a User y a los selectores
 *      relacionados en Listing previene cualquier casting arbitrario o uso de 'any'.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Usuarios particulares y PROs activos tienen is_ghost: false.
 *    - Perfiles fantasma/scraped no activados tienen is_ghost: true.
 *    - Consultas relacionales PostgREST (users!inner, seller:users).
 * -----------------------------------------------------------------------------
 */
