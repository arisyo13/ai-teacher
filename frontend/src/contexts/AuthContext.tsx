import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys, fetchAuthSession, type Profile } from "@/queries/auth";

interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const SESSION_STALE_TIME = 5 * 60 * 1000; // 5 min – session retained in cache

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: session, isLoading, isFetching } = useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchAuthSession,
    staleTime: SESSION_STALE_TIME,
    gcTime: SESSION_STALE_TIME,
    retry: false,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      const shouldInvalidate = event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY";

      if (!shouldInvalidate) return;
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(authKeys.session(), null);
  }, [queryClient]);

  const value: AuthState = {
    user: session?.user ?? null,
    profile: session?.profile ?? null,
    loading: isLoading || isFetching,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
