-- Adds branch_id to team_members and indexes it
-- Safe to run multiple times (checks existence)

DO $$
BEGIN
  -- Add column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN branch_id uuid NULL;
  END IF;

  -- Add foreign key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'team_members_branch_id_fkey'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;
  END IF;

  -- Create index if not exists
  CREATE INDEX IF NOT EXISTS idx_team_members_branch_id ON public.team_members USING btree (branch_id);
END $$;

-- Optional: refresh schema cache for PostgREST
-- call via RPC or run your existing script after migration

