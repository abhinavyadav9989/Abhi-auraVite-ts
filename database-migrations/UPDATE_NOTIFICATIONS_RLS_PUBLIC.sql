-- Relax notifications RLS for demo so clients can read their rows
-- If RLS exists, drop policies and disable RLS for simplicity

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    -- Disable RLS (safe for demo; tighten later if needed)
    ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure table is in realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.notifications;

