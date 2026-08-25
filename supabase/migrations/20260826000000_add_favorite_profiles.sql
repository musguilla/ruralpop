-- Create favorite_profiles table
CREATE TABLE IF NOT EXISTS public.favorite_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.favorite_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorite profiles" 
    ON public.favorite_profiles 
    FOR SELECT 
    USING (auth.uid() = follower_id);

CREATE POLICY "Users can insert their own favorite profiles" 
    ON public.favorite_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own favorite profiles" 
    ON public.favorite_profiles 
    FOR DELETE 
    USING (auth.uid() = follower_id);

-- Optional: Policy for the webhook to read who follows a profile
CREATE POLICY "Service role can do all" 
    ON public.favorite_profiles 
    FOR ALL 
    USING (true)
    WITH CHECK (true);
