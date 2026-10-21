import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { mergeFoodLogs, useFoodLog, type FoodLogData } from '../food/FoodLogContext';
import { useProfile } from '../profile/ProfileContext';
import { DEFAULT_PROFILE, type Profile } from '../profile/types';
import { useAuth } from './AuthContext';
import { getSupabase } from './supabase';

// Which account this device last synced with — decides how local data is treated on sign-in.
const LAST_USER_KEY = 'cloud:lastSyncedUser';
const PUSH_DELAY_MS = 1500;

async function push(userId: string, profile: Profile, food: FoodLogData) {
  const supabase = getSupabase();
  if (!supabase) return;
  const updated_at = new Date().toISOString();
  const { error } = await supabase.from('user_data').upsert(
    [
      { user_id: userId, key: 'profile', value: profile, updated_at },
      { user_id: userId, key: 'foodlog', value: food, updated_at },
    ],
    { onConflict: 'user_id,key' },
  );
  if (error) throw error;
}

// Keeps the signed-in user's profile and food log in sync with their account. Renders nothing.
//   On sign-in:  same account as last time → newest profile wins, food logs merge.
//                never synced before       → same, the device's data joins the account.
//                a different account       → that account's data replaces the device's (no mixing people's logs).
//   Afterwards:  local changes are pushed a moment after they happen.
export function CloudSync() {
  const { user, setSync } = useAuth();
  const { profile, loaded: profileLoaded, replace: replaceProfile } = useProfile();
  const { data: food, loaded: foodLoaded, replace: replaceFood } = useFoodLog();
  const [syncedUser, setSyncedUser] = useState<string | null>(null);
  const latest = useRef({ profile, food });
  latest.current = { profile, food };
  const lastPushed = useRef({ profile: 0, food: 0 });

  // Initial pull + merge after sign-in.
  useEffect(() => {
    if (!user) {
      setSyncedUser(null);
      return;
    }
    if (!profileLoaded || !foodLoaded || syncedUser === user.id) return;
    let cancelled = false;
    (async () => {
      setSync('syncing');
      try {
        const supabase = getSupabase()!;
        const { data, error } = await supabase.from('user_data').select('key, value').eq('user_id', user.id);
        if (error) throw error;
        const remoteProfile = data.find((r) => r.key === 'profile')?.value as Profile | undefined;
        const remoteFood = data.find((r) => r.key === 'foodlog')?.value as FoodLogData | undefined;
        const lastUser = await AsyncStorage.getItem(LAST_USER_KEY);
        const { profile: localProfile, food: localFood } = latest.current;
        const differentAccount = lastUser !== null && lastUser !== user.id;

        let nextProfile: Profile;
        let nextFood: FoodLogData;
        if (differentAccount) {
          nextProfile = remoteProfile ?? { ...DEFAULT_PROFILE };
          nextFood = remoteFood ?? { entries: [], deleted: [], updatedAt: 0 };
        } else {
          nextProfile = remoteProfile && remoteProfile.updatedAt > localProfile.updatedAt ? remoteProfile : localProfile;
          nextFood = remoteFood ? mergeFoodLogs(localFood, remoteFood) : localFood;
        }
        if (cancelled) return;
        if (nextProfile !== localProfile) replaceProfile(nextProfile);
        if (nextFood !== localFood) replaceFood(nextFood);
        await push(user.id, nextProfile, nextFood);
        lastPushed.current = { profile: nextProfile.updatedAt, food: nextFood.updatedAt };
        await AsyncStorage.setItem(LAST_USER_KEY, user.id);
        if (!cancelled) {
          setSyncedUser(user.id);
          setSync('synced', Date.now());
        }
      } catch {
        if (!cancelled) setSync('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, profileLoaded, foodLoaded, syncedUser, replaceProfile, replaceFood, setSync]);

  // Push local changes once the initial sync is done.
  useEffect(() => {
    if (!user || syncedUser !== user.id) return;
    if (profile.updatedAt === lastPushed.current.profile && food.updatedAt === lastPushed.current.food) return;
    const t = setTimeout(async () => {
      const snapshot = latest.current;
      setSync('syncing');
      try {
        await push(user.id, snapshot.profile, snapshot.food);
        lastPushed.current = { profile: snapshot.profile.updatedAt, food: snapshot.food.updatedAt };
        setSync('synced', Date.now());
      } catch {
        setSync('error');
      }
    }, PUSH_DELAY_MS);
    return () => clearTimeout(t);
  }, [user, syncedUser, profile.updatedAt, food.updatedAt, setSync]);

  return null;
}
