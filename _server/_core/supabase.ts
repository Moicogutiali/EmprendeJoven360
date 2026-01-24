import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase Server] Missing Supabase environment variables. Auth might fail.');
}

// Note: In a production environment, you should use the SERVICE_ROLE_KEY 
// to have admin privileges and verify tokens securely.
// For now, we'll use the anon key for verification.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
