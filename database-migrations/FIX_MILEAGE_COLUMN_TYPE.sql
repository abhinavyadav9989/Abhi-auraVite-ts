-- Fix numeric columns type from INTEGER to DECIMAL to support decimal values
-- This allows decimal values for mileage and kilometers instead of only whole numbers

-- Change mileage column from INTEGER to DECIMAL(5,2)
-- DECIMAL(5,2) allows values up to 999.99 km/l which is reasonable for vehicle mileage
ALTER TABLE public.vehicles 
ALTER COLUMN mileage TYPE DECIMAL(5,2);

-- Change kilometers column from INTEGER to DECIMAL(10,2) 
-- DECIMAL(10,2) allows values up to 99,999,999.99 km which is reasonable for total kilometers
ALTER TABLE public.vehicles 
ALTER COLUMN kilometers TYPE DECIMAL(10,2);

-- Add comments to document the changes
COMMENT ON COLUMN public.vehicles.mileage IS 'Vehicle mileage in km/l (kilometers per liter). Supports decimal values like 16.5, 20.3, etc.';
COMMENT ON COLUMN public.vehicles.kilometers IS 'Total kilometers driven. Supports decimal values for precision.';

-- Verify the changes
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND column_name IN ('mileage', 'kilometers')
ORDER BY column_name;
