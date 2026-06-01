export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number | null;
    price_type: 'fixed' | 'negotiable' | 'exchange';
    location: string | any;
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
}

export interface User {
    id: string;
    name: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    created_at?: string;
    role?: string;
    commercial_name?: string;
}
