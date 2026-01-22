
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables! Check .env.local");
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

console.log('Supabase Client Initialized', { url: supabaseUrl });
