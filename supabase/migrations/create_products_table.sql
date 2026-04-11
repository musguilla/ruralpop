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

-- Seed Data (Gorras and Camisetas via explicit creation order to control UI sorting)
INSERT INTO public.products (slug, title, description, price, stock, image_urls, created_at)
VALUES 
('gorra-atardecer-tractor', 'Gorra Sunset', 'Exclusiva gorra con diseño de atardecer y tractor. Perfecta para el sol del campo.', 15.00, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor-2.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-atardecer-tractor-3.jpg'], now() + interval '10 seconds'),
('gorra-acid-bull', 'Gorra Acid Bull', 'Diseño moderno y atrevido con un toque rebelde.', 15.00, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull-2.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-acid-bull-3.jpg'], now() + interval '9 seconds'),
('gorra-green-pop', 'Gorra GreenPop', 'El color de nuestra tierra. Estilo clásico e inconfundible de Ruralpop.', 15.00, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop-2.jpg','https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/gorra-green-pop-3.jpg'], now() + interval '8 seconds'),
('camiseta-bull-blanca', 'Camiseta Bull Blanca', 'Camiseta clásica blanca con el toro original de Ruralpop. Diseño 100% estilo rural.', 9.90, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/camiseta-bull-blanca.jpg'], now() + interval '7 seconds'),
('camiseta-ruralpop-blanca', 'Camiseta Ruralpop Blanca', 'Nuestra insignia. La marca de los que sienten el campo en su día a día.', 9.90, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/camiseta-ruralpop-blanca.jpg'], now() + interval '6 seconds'),
('camiseta-ruralpop-verde', 'Camiseta Ruralpop Verde', 'Tu esencia rural en tejido premium verde campo con el logo original.', 9.90, 100, ARRAY['https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/products/camiseta-ruralpop-verde.jpg'], now() + interval '5 seconds')
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    image_urls = EXCLUDED.image_urls,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    created_at = EXCLUDED.created_at;
