import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cloudConfigured, getSupabase } from './supabase';

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'error';

type AuthValue = {
  configured: boolean;
  user: User | null;
  ready: boolean; // session restored (or no cloud)
  signIn: (email: string, password: string) => Promise<string | null>; // returns an error message
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>; // returns an error message
  syncStatus: SyncStatus;
  lastSynced: number | null;
  setSync: (status: SyncStatus, at?: number) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

const friendly = (message: string) =>
  /invalid login/i.test(message)
    ? 'Wrong email or password.'
    : /email not confirmed/i.test(message)
      ? 'Please confirm your email first — check your inbox for the link.'
      : /rate limit/i.test(message)
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : message;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!cloudConfigured);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off');
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return setReady(true);
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return 'Accounts are not set up yet.';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? friendly(error.message) : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Accounts are not set up yet.', needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: friendly(error.message), needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setSyncStatus('off');
  }, []);

  const deleteAccount = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return 'Accounts are not set up yet.';
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      return /could not find the function|does not exist/i.test(error.message)
        ? "Account deletion isn't set up in the database yet (run supabase/002_delete_account.sql)."
        : friendly(error.message);
    }
    // Forget the deleted account so this device's data is treated as the person's own on the next sign-in.
    await AsyncStorage.removeItem('cloud:lastSyncedUser').catch(() => {});
    await supabase.auth.signOut().catch(() => {});
    setSyncStatus('off');
    return null;
  }, []);

  const setSync = useCallback((status: SyncStatus, at?: number) => {
    setSyncStatus(status);
    if (at) setLastSynced(at);
  }, []);

  const value = useMemo(
    () => ({ configured: cloudConfigured, user: session?.user ?? null, ready, signIn, signUp, signOut, deleteAccount, syncStatus, lastSynced, setSync }),
    [session, ready, signIn, signUp, signOut, deleteAccount, syncStatus, lastSynced, setSync],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
