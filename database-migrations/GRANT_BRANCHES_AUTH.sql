-- Grant basic CRUD on branches to authenticated users (client-side access)
-- Use only when RLS is DISABLED on branches

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.branches TO authenticated;

-- Also grant usage on schema (usually already present)
GRANT USAGE ON SCHEMA public TO authenticated;


