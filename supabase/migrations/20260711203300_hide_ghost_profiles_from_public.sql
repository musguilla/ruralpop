-- Actualizar la política de RLS de la tabla listings para ocultar los anuncios de los perfiles fantasma (is_ghost = true)
-- Esto soluciona que los anuncios de las tiendas "fantasma" aparezcan en la app móvil de Equipop.
-- La web ya lo filtraba en el cliente, pero la app móvil no. Cambiando el RLS se arregla de raíz sin tener que actualizar la app.

DROP POLICY IF EXISTS "Active listings are viewable by everyone." ON public.listings;

CREATE POLICY "Active listings are viewable by everyone." 
ON public.listings FOR SELECT 
USING (
  (status = 'active' AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = listings.user_id AND is_ghost = true)) 
  OR auth.uid() = user_id
);
