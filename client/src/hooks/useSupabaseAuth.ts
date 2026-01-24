import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: AuthError | null;
    isAuthenticated: boolean;
}

export function useSupabaseAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            setState({
                user: session?.user ?? null,
                session,
                loading: false,
                error: error ?? null,
                isAuthenticated: !!session,
            });
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({
                user: session?.user ?? null,
                session,
                loading: false,
                error: null,
                isAuthenticated: !!session,
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = useCallback(
        async (email: string, password: string, metadata?: { name?: string }) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setState((prev) => ({ ...prev, loading: false, error }));
                throw error;
            }

            return data;
        },
        []
    );

    const signIn = useCallback(async (email: string, password: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setState((prev) => ({ ...prev, loading: false, error }));
            throw error;
        }

        return data;
    }, []);

    const signInWithOAuth = useCallback(
        async (provider: 'google' | 'github' | 'gitlab') => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setState((prev) => ({ ...prev, loading: false, error }));
                throw error;
            }

            return data;
        },
        []
    );

    const signOut = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { error } = await supabase.auth.signOut();

        if (error) {
            setState((prev) => ({ ...prev, loading: false, error }));
            throw error;
        }

        setState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false,
        });
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;
        return data;
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
        return data;
    }, []);

    return {
        ...state,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        refresh: () => supabase.auth.refreshSession(),
    };
}
