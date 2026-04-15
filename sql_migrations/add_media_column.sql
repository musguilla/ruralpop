-- 1. Añadimos la columna 'media' a 'products'
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS media JSONB[] DEFAULT '{}'::JSONB[];

-- 2. (Opcional por ahora) Añadimos la columna 'media' a 'listings' para cuando migremos los tractores
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS media JSONB[] DEFAULT '{}'::JSONB[];

-- 3. (Opcional por ahora) Añadimos la columna 'media' a 'magazine_posts' (o equivalente del cms)
-- Sustituye 'magazine_posts' por el nombre real de la tabla de tu blog
-- ALTER TABLE public.magazine_posts 
-- ADD COLUMN IF NOT EXISTS media JSONB[] DEFAULT '{}'::JSONB[];
