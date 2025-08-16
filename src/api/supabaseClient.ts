import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) {
    missingVars.push('VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    missingVars.push(
      'VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  const message = `Missing required environment variables: ${missingVars.join(', ')}`;
  console.error(message);
  throw new Error(message);
}

console.log('Supabase Client Configuration:', {
  supabaseUrl,
  supabaseAnonKey: `${supabaseAnonKey.substring(0, 20)}...`,
  hasViteUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasNextPublicUrl: !!import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  hasViteKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasNextPublicKey: !!import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error);
  } else {
    console.log('Supabase connection test successful');
  }
});

// Export for backward compatibility
export const base44 = supabase;

