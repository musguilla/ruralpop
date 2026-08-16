BEGIN;
DROP POLICY IF EXISTS "Active listings are viewable by everyone." ON public.listings;
CREATE POLICY "Active listings are viewable by everyone." ON public.listings FOR SELECT USING (status IN ('active', 'sold') OR auth.uid() = user_id);
COMMIT;
