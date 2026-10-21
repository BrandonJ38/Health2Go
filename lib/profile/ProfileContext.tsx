import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_PROFILE, type Profile } from './types';

// Saved on the device; synced to the user's account when signed in (lib/cloud/CloudSync.tsx).
const STORAGE_KEY = 'profile:v1';

type ProfileContextValue = {
  profile: Profile;
  loaded: boolean;
  update: (changes: Partial<Profile>) => void;
  replace: (next: Profile) => void; // load a synced copy as-is (keeps its updatedAt)
  reset: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        // Spread over defaults so fields added in later versions get sensible values.
        if (raw) setProfile({ ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) });
      })
      .catch(() => {
        // Unreadable storage (private browsing etc.) — start fresh rather than block the app.
      })
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((next: Profile) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (changes: Partial<Profile>) =>
      setProfile((prev) => {
        const next = { ...prev, ...changes, updatedAt: Date.now() };
        persist(next);
        return next;
      }),
    [persist],
  );

  const replace = useCallback(
    (next: Profile) => {
      const merged = { ...DEFAULT_PROFILE, ...next };
      setProfile(merged);
      persist(merged);
    },
    [persist],
  );

  const reset = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => ({ profile, loaded, update, replace, reset }), [profile, loaded, update, replace, reset]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
