# Supabase Configuration

## Environment Variables Setup

Since you want to use the Next.js environment variables that Supabase provided, create a `.env` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uyahditchuyudbpphfry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YWhkaXRjaHV5dWRicHBoZnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTE2NDEsImV4cCI6MjA3MDQ2NzY0MX0.WDV9zfZXDvMPzF7KbP3rH-tO7uswlfVobOz4HI4UmkA
```

## Important Notes

1. **Environment Variable Prefix**: We're using `NEXT_PUBLIC_` prefix as provided by Supabase
2. **File Location**: Place the `.env` file in your project root (same level as `package.json`)
3. **Restart Required**: After creating the `.env` file, restart your development server

## Why This Works

Our `supabaseClient.ts` is configured to:
- First try `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (as provided by Supabase)
- Fall back to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite format)
- Finally fall back to hardcoded values

## Next Steps

1. Create the `.env` file with the above content
2. Restart your development server: `npm run dev`
3. Test the connection using the SupabaseTest component
4. Set up your database schema using the SQL from `SUPABASE_MIGRATION.md`

## Testing the Connection

The test component will show you if the connection is working. You should see:
- ✅ Connection successful! (if database tables exist)
- ❌ Error: relation "dealers" does not exist (if tables don't exist yet - this is normal!)
