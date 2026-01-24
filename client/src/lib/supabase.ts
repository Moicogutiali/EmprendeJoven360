import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
});

// Types for database
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: number;
                    openId: string;
                    name: string | null;
                    email: string | null;
                    loginMethod: string | null;
                    role: 'emprendedor' | 'mentor' | 'admin';
                    createdAt: string;
                    updatedAt: string;
                    lastSignedIn: string;
                };
                Insert: {
                    id?: never;
                    openId: string;
                    name?: string | null;
                    email?: string | null;
                    loginMethod?: string | null;
                    role?: 'emprendedor' | 'mentor' | 'admin';
                    createdAt?: string;
                    updatedAt?: string;
                    lastSignedIn?: string;
                };
                Update: {
                    id?: never;
                    openId?: string;
                    name?: string | null;
                    email?: string | null;
                    loginMethod?: string | null;
                    role?: 'emprendedor' | 'mentor' | 'admin';
                    createdAt?: string;
                    updatedAt?: string;
                    lastSignedIn?: string;
                };
            };
        };
    };
};
