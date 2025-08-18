-- Add Vehicle Type Column to Vehicles Table
-- Run this in your Supabase SQL Editor

-- Add vehicle_type column to vehicles table
DO $$ BEGIN
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'personal';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Create an enum for vehicle types (optional - for better data validation)
DO $$ BEGIN
    CREATE TYPE vehicle_type_enum AS ENUM ('personal', 'commercial');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add a comment to explain the column
COMMENT ON COLUMN vehicles.vehicle_type IS 'Type of vehicle: personal or commercial';

-- Verify the column was added
SELECT 'Vehicle type column added successfully!' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name = 'vehicle_type';
