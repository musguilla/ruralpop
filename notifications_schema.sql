-- Create Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Webhook Trigger Function for Favorites
CREATE OR REPLACE FUNCTION public.handle_favorite_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume pg_net is enabled. If not, this will fail. We will use http_request.
  -- To make this completely fail-safe without pg_net, the user should use the Supabase Dashboard Webhooks UI.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
