import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');

if (!isConfigured) {
  console.warn('Supabase environment variables are missing. Using placeholder values until you add VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});