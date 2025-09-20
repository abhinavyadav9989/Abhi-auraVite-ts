-- Migration: Add paint_ok to public.vehicle_condition and backfill from vehicles
-- Notes:
-- - number_of_keys already exists on public.vehicle_condition; no action needed for it.
-- - Run this in Supabase SQL editor or psql against your database.

BEGIN;

ALTER TABLE public.vehicle_condition
ADD COLUMN IF NOT EXISTS paint_ok boolean;

-- Optional backfill from vehicles.paint_ok if present
UPDATE public.vehicle_condition vc
SET paint_ok = v.paint_ok
FROM public.vehicles v
WHERE vc.vehicle_id = v.id
  AND vc.paint_ok IS NULL
  AND v.paint_ok IS NOT NULL;

COMMIT;


