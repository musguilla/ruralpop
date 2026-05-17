-- Añadir la columna tenant_id a public.users si no existe
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Actualizar el trigger de registro de Auth para incluir el tenant_id
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, tenant_id)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    -- Casting to UUID explicitly to handle missing fields cleanly
    NULLIF(new.raw_user_meta_data->>'tenant_id', '')::UUID
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: Migrar el tenant_id de auth.users a public.users para los usuarios ya registrados (como el de Equipop)
UPDATE public.users pu
SET tenant_id = NULLIF(au.raw_user_meta_data->>'tenant_id', '')::UUID
FROM auth.users au
WHERE pu.id = au.id
  AND au.raw_user_meta_data->>'tenant_id' IS NOT NULL;
