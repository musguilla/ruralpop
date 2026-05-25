-- 1. Añadir columnas de información legal a los usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS nif text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zoo_register_number text;

-- 2. Añadir el estado 'draft' al enum listing_status
-- Nota: PostgreSQL no permite usar IF NOT EXISTS al añadir valores a un ENUM en todas las versiones,
-- pero sí se puede envolver en un bloque anónimo para evitar errores si ya existe.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'listing_status' AND e.enumlabel = 'draft') THEN
        ALTER TYPE listing_status ADD VALUE 'draft';
    END IF;
END $$;
