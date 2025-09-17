-- Add canonical sold fields to vehicles
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS sold boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz,
  ADD COLUMN IF NOT EXISTS sold_to_dealer_id uuid;

-- Optional index for filtering/hiding sold inventory
CREATE INDEX IF NOT EXISTS idx_vehicles_sold ON public.vehicles(sold);

