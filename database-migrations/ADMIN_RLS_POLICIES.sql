-- Admin RLS Policies
-- Run this in your Supabase SQL Editor to give admin users access to all data

-- Dealers table - Admin can view all dealers
DROP POLICY IF EXISTS "Admin can view all dealers" ON dealers;
CREATE POLICY "Admin can view all dealers" ON dealers
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Vehicles table - Admin can view all vehicles  
DROP POLICY IF EXISTS "Admin can view all vehicles" ON vehicles;
CREATE POLICY "Admin can view all vehicles" ON vehicles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Transactions table - Admin can view all transactions
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;
CREATE POLICY "Admin can view all transactions" ON transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer documents table - Admin can view all documents
DROP POLICY IF EXISTS "Admin can view all dealer documents" ON dealer_documents;
CREATE POLICY "Admin can view all dealer documents" ON dealer_documents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Vehicle assets table - Admin can view all assets
DROP POLICY IF EXISTS "Admin can view all vehicle assets" ON vehicle_assets;
CREATE POLICY "Admin can view all vehicle assets" ON vehicle_assets
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Bank accounts table - Admin can view all bank accounts
DROP POLICY IF EXISTS "Admin can view all bank accounts" ON bank_accounts;
CREATE POLICY "Admin can view all bank accounts" ON bank_accounts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Shortlists table - Admin can view all shortlists
DROP POLICY IF EXISTS "Admin can view all shortlists" ON shortlists;
CREATE POLICY "Admin can view all shortlists" ON shortlists
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Vehicle inspections table - Admin can view all inspections
DROP POLICY IF EXISTS "Admin can view all vehicle inspections" ON vehicle_inspections;
CREATE POLICY "Admin can view all vehicle inspections" ON vehicle_inspections
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Logistics orders table - Admin can view all orders
DROP POLICY IF EXISTS "Admin can view all logistics orders" ON logistics_orders;
CREATE POLICY "Admin can view all logistics orders" ON logistics_orders
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- RTO applications table - Admin can view all applications
DROP POLICY IF EXISTS "Admin can view all rto applications" ON rto_applications;
CREATE POLICY "Admin can view all rto applications" ON rto_applications
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer preferences table - Admin can view all preferences
DROP POLICY IF EXISTS "Admin can view all dealer preferences" ON dealer_preferences;
CREATE POLICY "Admin can view all dealer preferences" ON dealer_preferences
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer hours table - Admin can view all hours
DROP POLICY IF EXISTS "Admin can view all dealer hours" ON dealer_hours;
CREATE POLICY "Admin can view all dealer hours" ON dealer_hours
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer reviews table - Admin can view all reviews
DROP POLICY IF EXISTS "Admin can view all dealer reviews" ON dealer_reviews;
CREATE POLICY "Admin can view all dealer reviews" ON dealer_reviews
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Dealer inquiries table - Admin can view all inquiries
DROP POLICY IF EXISTS "Admin can view all dealer inquiries" ON dealer_inquiries;
CREATE POLICY "Admin can view all dealer inquiries" ON dealer_inquiries
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Payments table - Admin can view all payments
DROP POLICY IF EXISTS "Admin can view all payments" ON payments;
CREATE POLICY "Admin can view all payments" ON payments
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
