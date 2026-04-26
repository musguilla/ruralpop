-- 1. Crear tabla categories
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Crear tabla subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS (Row Level Security) para que sean de lectura pública
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (Cualquier usuario puede leer las categorías)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories FOR SELECT USING (true);

-- 3. Insertar las Categorías
INSERT INTO public.categories (id, name, order_index) VALUES
('ganaderia', 'Ganadería', 10),
('maquinaria', 'Maquinaria y herramientas', 20),
('forraje', 'Forraje y alimentación', 30),
('fincas', 'Fincas', 40),
('servicios', 'Servicios', 50),
('alimentos', 'Alimentos Km0', 60)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;

-- 4. Insertar las Subcategorías
-- Subcategorías de Ganadería
INSERT INTO public.subcategories (category_id, name, order_index) VALUES
('ganaderia', 'Bovino', 10),
('ganaderia', 'Equino', 20),
('ganaderia', 'Caprino', 30),
('ganaderia', 'Ovino', 40),
('ganaderia', 'Porcino', 50),
('ganaderia', 'Avicultura', 60),
('ganaderia', 'Apicultura', 70),
('ganaderia', 'Perros', 80),
('ganaderia', 'Conejos', 90),
('ganaderia', 'Otros', 100);

-- Subcategorías de Maquinaria
INSERT INTO public.subcategories (category_id, name, order_index) VALUES
('maquinaria', 'Tractores', 10),
('maquinaria', 'Abonadoras', 20),
('maquinaria', 'Cosechadoras', 30),
('maquinaria', 'Desbrozadoras', 40),
('maquinaria', 'Encintadoras', 50),
('maquinaria', 'Empacadoras', 60),
('maquinaria', 'Motocultores', 70),
('maquinaria', 'Remolques agrícolas', 80),
('maquinaria', 'Sembradoras', 90),
('maquinaria', 'Sulfatadoras', 100),
('maquinaria', 'Trituradoras', 110),
('maquinaria', 'Volteadoras', 120),
('maquinaria', 'Otra maquinaria agrícola', 130);

-- Subcategorías de Servicios
INSERT INTO public.subcategories (category_id, name, order_index) VALUES
('servicios', 'Desbroce', 10),
('servicios', 'Transporte', 20),
('servicios', 'Veterinarios', 30),
('servicios', 'Herradores', 40);

-- (Forraje, Fincas y Alimentos no tienen subcategorías, así que no insertamos nada para ellas)
