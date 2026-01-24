import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { trpc } from '@/lib/trpc';
import { useCallback, useEffect, useMemo } from 'react';

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = '/auth' } = options ?? {};

  // Use Supabase Auth as primary source
  const supabaseAuth = useSupabaseAuth();
  const utils = trpc.useUtils();

  // Sync with tRPC when user is authenticated
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: supabaseAuth.isAuthenticated,
  });

  const logout = useCallback(async () => {
    try {
      await supabaseAuth.signOut();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [supabaseAuth, utils]);

  const state = useMemo(() => {
    // 1. Try to use database user (most complete source with correct numeric ID)
    if (meQuery.data) {
      return {
        user: meQuery.data,
        loading: meQuery.isLoading,
        error: meQuery.error || null,
        isAuthenticated: true,
      };
    }

    // 2. Fallback to Supabase session user (temporary while fetching DB user or if offline)
    if (supabaseAuth.isAuthenticated && supabaseAuth.user) {
      const user = {
        // Use a temporary ID of 0 until DB user is loaded. 
        // Components should rely on openId for identity where possible in this state.
        id: 0,
        openId: supabaseAuth.user.id,
        name: supabaseAuth.user.user_metadata?.name || supabaseAuth.user.email?.split('@')[0] || 'Cargando...',
        email: supabaseAuth.user.email || null,
        role: (supabaseAuth.user.user_metadata?.role || 'emprendedor') as 'emprendedor' | 'mentor' | 'admin',
        loginMethod: 'supabase',
        createdAt: supabaseAuth.user.created_at,
        updatedAt: new Date().toISOString(),
        lastSignedIn: new Date().toISOString(),
      };

      return {
        user,
        loading: true, // Still loading until DB user arrives
        error: supabaseAuth.error || meQuery.error || null,
        isAuthenticated: true,
      };
    }

    // 3. Not authenticated
    return {
      user: null,
      loading: supabaseAuth.loading || meQuery.isLoading,
      error: supabaseAuth.error || meQuery.error || null,
      isAuthenticated: false,
    };
  }, [supabaseAuth, meQuery.data, meQuery.error, meQuery.isLoading]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === 'undefined') return;
    if (window.location.pathname === redirectPath) return;
    if (window.location.pathname.startsWith('/auth')) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => {
      supabaseAuth.refresh();
      meQuery.refetch();
    },
    logout,
    // Expose Supabase auth methods
    signUp: supabaseAuth.signUp,
    signIn: supabaseAuth.signIn,
    signInWithOAuth: supabaseAuth.signInWithOAuth,
  };
}
