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
    user_id: string;
    status: 'active' | 'sold' | 'draft';
    contact_phone?: string;
    is_featured?: boolean;
}

export interface User {
    id: string;
    name: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    created_at?: string;
}
