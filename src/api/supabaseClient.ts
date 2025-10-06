import { createClient } from '@supabase/supabase-js';
import { devLogger } from '../utils';

// Supabase credentials - using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://uyahditchuyudbpphfry.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YWhkaXRjaHV5dWRicHBoZnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTE2NDEsImV4cCI6MjA3MDQ2NzY0MX0.WDV9zfZXDvMPzF7KbP3rH-tO7uswlfVobOz4HI4UmkA';

devLogger.info('Supabase Client Configuration', {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET',
  hasViteUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
  hasNextPublicUrl: Boolean(import.meta.env.NEXT_PUBLIC_SUPABASE_URL),
  hasViteKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
  hasNextPublicKey: Boolean(import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
});

// Create Supabase client
// Route Edge Functions via relative path in dev to use Vite proxy and avoid CORS
const functionsBase = (typeof window !== 'undefined' && window.location.origin.includes('localhost'))
  ? '/functions/v1'
  : undefined; // use default in prod

// Note: older @supabase/supabase-js does not accept `functions` in options.
// Use the 3-arg overload and then override the functions URL via .functions.setURL when available.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

try {
  // @ts-ignore - setURL exists in v2.43+; ignore if not available
  if (functionsBase && supabase.functions?.setURL) {
    // @ts-ignore
    supabase.functions.setURL(functionsBase);
  }
} catch {}

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    devLogger.error('Supabase connection test failed:', error);
  } else {
    devLogger.info('Supabase connection test successful');
  }
});

// Export for backward compatibility
export const base44 = supabase;
