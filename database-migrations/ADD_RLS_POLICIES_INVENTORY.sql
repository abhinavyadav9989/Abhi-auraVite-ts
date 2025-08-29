-- Inventory RLS policies (vehicles, branches) scoped by team_members
-- Safe to run multiple times

-- Helper: ensure RLS is enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Vehicles: SELECT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='vehicles_select_scoped'
  ) THEN
    CREATE POLICY vehicles_select_scoped ON public.vehicles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = vehicles.dealer_id
          AND (
            tm.role IN ('owner','admin')
            OR vehicles.branch_id IS NULL
            OR vehicles.branch_id = tm.branch_id
          )
      )
    );
  END IF;
END $$;

-- Vehicles: INSERT/UPDATE/DELETE policy (manage_inventory or admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='vehicles_write_scoped'
  ) THEN
    CREATE POLICY vehicles_write_scoped ON public.vehicles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = vehicles.dealer_id
          AND (
            tm.role IN ('owner','admin')
            OR (vehicles.branch_id = tm.branch_id AND (tm.permissions ? 'manage_inventory' OR tm.permissions ? 'edit'))
          )
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = vehicles.dealer_id
          AND (
            tm.role IN ('owner','admin')
            OR (vehicles.branch_id = tm.branch_id AND (tm.permissions ? 'manage_inventory' OR tm.permissions ? 'edit'))
          )
      )
    );
  END IF;
END $$;

-- Branches: SELECT policy (dealer scope)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_select_scoped'
  ) THEN
    CREATE POLICY branches_select_scoped ON public.branches
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = branches.dealer_id
      )
    );
  END IF;
END $$;

-- Branches: INSERT/UPDATE/DELETE for owner/admin or manage_branches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='branches' AND policyname='branches_write_scoped'
  ) THEN
    CREATE POLICY branches_write_scoped ON public.branches
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = branches.dealer_id
          AND (tm.role IN ('owner','admin') OR tm.permissions ? 'manage_branches')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.dealer_id = branches.dealer_id
          AND (tm.role IN ('owner','admin') OR tm.permissions ? 'manage_branches')
      )
    );
  END IF;
END $$;

-- Team members: SELECT self or same dealer for admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_select_self_or_admin'
  ) THEN
    CREATE POLICY team_members_select_self_or_admin ON public.team_members
    FOR SELECT
    USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.team_members me
        WHERE me.user_id = auth.uid()
          AND me.dealer_id = team_members.dealer_id
          AND me.role IN ('owner','admin')
      )
    );
  END IF;
END $$;

-- Team members: allow a newly signed-up user to claim their pending row by email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_select_claim_by_email'
  ) THEN
    CREATE POLICY team_members_select_claim_by_email ON public.team_members
    FOR SELECT
    USING (
      user_id IS NULL AND (auth.jwt() ->> 'email') = team_members.email
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_update_claim_by_email'
  ) THEN
    CREATE POLICY team_members_update_claim_by_email ON public.team_members
    FOR UPDATE
    USING (
      user_id IS NULL AND (auth.jwt() ->> 'email') = team_members.email
    )
    WITH CHECK (
      user_id IS NULL AND (auth.jwt() ->> 'email') = team_members.email
    );
  END IF;
END $$;


