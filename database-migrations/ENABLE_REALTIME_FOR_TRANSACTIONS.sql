-- Enable real-time replication for transactions table
-- This allows real-time updates for deal room messages and counter offers

-- Add transactions table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Verify the table is added to the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'transactions';
