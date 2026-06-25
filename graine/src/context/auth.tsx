import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  level: number;
  xp: number;
};

export type Merchant = {
  id: string;
  name: string;
  slug: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  accountType: 'perso' | 'pro';
  businessName?: string;
};

type AuthContextValue = {
  /** Supabase est-il branché ? Sinon l'app tourne en mode démo (pas de gating). */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  merchant: Merchant | null;
  /** L'utilisateur dispose-t-il d'un compte pro (marchand associé) ? */
  hasPro: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // En mode démo (Supabase non branché) on ne charge rien : loading = false.
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  // Charge le profil + l'éventuel marchand associé.
  const loadUser = useCallback(async (userId: string) => {
    setLoading(true);

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_admin, level, xp')
      .eq('id', userId)
      .maybeSingle();
    setProfile(profileRow ?? null);

    const { data: memberRow } = await supabase
      .from('merchant_members')
      .select('merchant:merchants(id, name, slug)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    setMerchant((memberRow?.merchant as Merchant | undefined) ?? null);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void loadUser(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        void loadUser(newSession.user.id);
      } else {
        setProfile(null);
        setMerchant(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadUser]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(params: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          username: params.username,
          full_name: params.fullName ?? null,
          account_type: params.accountType,
          business_name: params.businessName ?? null,
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    // Session nulle = confirmation e-mail requise côté projet Supabase.
    return { needsConfirmation: data.session === null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      profile,
      merchant,
      hasPro: merchant !== null,
      signIn,
      signUp,
      signOut,
    }),
    [loading, session, profile, merchant],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }
  return ctx;
}
