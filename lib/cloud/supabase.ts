import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { LargeSecureStore } from './secureSessionStore';

// The URL and publishable key are designed to be public (they ship inside every app);
// Row Level Security in supabase/schema.sql is what protects the data.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const cloudConfigured = !!url && !!key;

let client: SupabaseClient | null = null;

// Created lazily, and never during server rendering of the web build (no storage there).
export function getSupabase(): SupabaseClient | null {
  if (!cloudConfigured || typeof window === 'undefined') return null;
  if (!client) {
    client = createClient(url!, key!, {
      auth: {
        // Phones: encrypted session (key in the device keychain). Web: browser storage.
        storage: Platform.OS === 'web' ? AsyncStorage : new LargeSecureStore(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    // On phones, only refresh the session while the app is in the foreground.
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', (state) => {
        if (state === 'active') client?.auth.startAutoRefresh();
        else client?.auth.stopAutoRefresh();
      });
    }
  }
  return client;
}
