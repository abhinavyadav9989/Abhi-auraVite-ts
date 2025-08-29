-- Revert: remove inventory RLS policies and disable RLS (restore open access)

-- Drop policies on vehicles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='vehicles_select_scoped') THEN
    DROP POLICY vehicles_select_scoped ON public.vehicles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='vehicles_write_scoped') THEN
    DROP POLICY vehicles_write_scoped ON public.vehicles;
  END IF;
END $$;

-- Drop policies on branches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_select_scoped') THEN
    DROP POLICY branches_select_scoped ON public.branches;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_write_scoped') THEN
    DROP POLICY branches_write_scoped ON public.branches;
  END IF;
END $$;

-- Drop helper claim policies on team_members
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_select_self_or_admin') THEN
    DROP POLICY team_members_select_self_or_admin ON public.team_members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_select_claim_by_email') THEN
    DROP POLICY team_members_select_claim_by_email ON public.team_members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_update_claim_by_email') THEN
    DROP POLICY team_members_update_claim_by_email ON public.team_members;
  END IF;
END $$;

-- Optionally disable RLS to fully restore pre-policy behavior
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;


