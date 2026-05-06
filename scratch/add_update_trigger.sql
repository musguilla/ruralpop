-- Función para actualizar el perfil público cuando cambian datos en auth.users
CREATE OR REPLACE FUNCTION public.handle_update_user() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET 
    email = new.email,
    name = COALESCE(new.raw_user_meta_data->>'name', public.users.name)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador (trigger) para ejecutar la función tras un UPDATE
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();
