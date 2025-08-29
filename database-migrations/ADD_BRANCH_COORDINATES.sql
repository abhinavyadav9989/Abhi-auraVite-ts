-- Add latitude and longitude columns to branches table for 3D globe positioning
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT 20.5937,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT 78.9629;

-- Add comments for documentation
COMMENT ON COLUMN public.branches.latitude IS 'Latitude coordinate for branch location on globe (default: India center)';
COMMENT ON COLUMN public.branches.longitude IS 'Longitude coordinate for branch location on globe (default: India center)';

-- Update existing branches with default coordinates if they don't have them
UPDATE public.branches 
SET 
    latitude = 20.5937,
    longitude = 78.9629
WHERE latitude IS NULL OR longitude IS NULL;

-- Add constraints to ensure valid coordinates
ALTER TABLE public.branches 
ADD CONSTRAINT check_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_longitude_range CHECK (longitude >= -180 AND longitude <= 180);
