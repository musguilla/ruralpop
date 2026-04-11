-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_urls text[] NOT NULL DEFAULT '{}',
    stock integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'active'
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- No public insert/update/delete policies; admin only via dashboard or service role

-- Seed Data (3 Hats)
INSERT INTO public.products (slug, title, description, price, stock, image_urls)
VALUES 
('gorra-atardecer-tractor', 'Gorra Atardecer Tractor', 'Exclusiva gorra con diseño de atardecer y tractor. Perfecta para el sol del campo.', 15.00, 100, ARRAY[
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor-2.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor-3.jpg'
]),
('gorra-acid-bull', 'Gorra Acid Bull', 'Diseño moderno y atrevido con un toque rebelde.', 15.00, 100, ARRAY[
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull-2.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull-3.jpg'
]),
('gorra-green-pop', 'Gorra Green Pop', 'El color de nuestra tierra. Estilo clásico e inconfundible de Ruralpop.', 15.00, 100, ARRAY[
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop-2.jpg',
    'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop-3.jpg'
])
ON CONFLICT (slug) DO UPDATE SET 
    image_urls = EXCLUDED.image_urls,
    price = EXCLUDED.price;
