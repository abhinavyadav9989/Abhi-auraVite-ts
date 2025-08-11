import { createClient } from '@supabase/supabase-js';

// Supabase credentials - using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://uyahditchuyudbpphfry.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YWhkaXRjaHV5dWRicHBoZnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTE2NDEsImV4cCI6MjA3MDQ2NzY0MX0.WDV9zfZXDvMPzF7KbP3rH-tO7uswlfVobOz4HI4UmkA';

console.log('Supabase Client Configuration:', {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET',
  hasViteUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasNextPublicUrl: !!import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  hasViteKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasNextPublicKey: !!import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error);
  } else {
    console.log('Supabase connection test successful');
  }
});

// Export for backward compatibility
export const base44 = supabase;
