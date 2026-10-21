import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../lib/cloud/AuthContext';

const MIN_PASSWORD = 8;

export default function AccountScreen() {
  const router = useRouter();
  const { configured, user, ready, signIn, signUp, signOut, deleteAccount, syncStatus, lastSynced } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  if (!configured) {
    return (
      <Screen title="Account" subtitle="Back up your data and use the app on more than one device.">
        <View style={styles.card}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.textMuted} />
          <Text style={styles.body}>
            Accounts aren't connected yet. Add your Supabase project URL and publishable key to .env.local, then restart the
            server. Everything still works without an account — your data stays on this device.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen title="Account">
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (user) {
    const status =
      syncStatus === 'syncing'
        ? 'Syncing…'
        : syncStatus === 'error'
          ? "Couldn't sync — will retry when you make a change"
          : lastSynced
            ? `Synced at ${new Date(lastSynced).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : 'Synced';
    return (
      <Screen title="Account" subtitle="Your profile and food log are backed up to your account.">
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={[styles.status, syncStatus === 'error' && styles.error]}>{status}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.body}>
          Sign in with this email on another phone or on the web to pick up where you left off. You can also report what oils
          restaurants use, to help others.
        </Text>
        <Pressable style={styles.secondary} onPress={() => signOut()}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </Pressable>
        <Text style={styles.small}>Signing out keeps your data on this device.</Text>

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.small}>
            Permanently deletes your account, your backed-up profile and food log, and your restaurant reports. Data saved on this device stays
            until you use Start over in Profile.
          </Text>
          {deleteError ? <Text style={[styles.message, styles.error]}>{deleteError}</Text> : null}
          <Pressable
            style={[styles.secondary, confirmDelete && styles.dangerButton, busy && { opacity: 0.6 }]}
            disabled={busy}
            onPress={async () => {
              if (!confirmDelete) return setConfirmDelete(true);
              setBusy(true);
              const error = await deleteAccount();
              setBusy(false);
              setConfirmDelete(false);
              setDeleteError(error);
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryText, confirmDelete && { color: '#FFFFFF' }]}>
              {confirmDelete ? 'Tap again to permanently delete' : 'Delete my account'}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const submit = async () => {
    setMessage(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMessage({ text: 'Enter a valid email address.', error: true });
    if (password.length < MIN_PASSWORD) return setMessage({ text: `Password must be at least ${MIN_PASSWORD} characters.`, error: true });
    setBusy(true);
    if (mode === 'signIn') {
      const error = await signIn(email, password);
      setBusy(false);
      if (error) return setMessage({ text: error, error: true });
      if (router.canGoBack()) router.back();
    } else {
      const { error, needsConfirmation } = await signUp(email, password);
      setBusy(false);
      if (error) return setMessage({ text: error, error: true });
      if (needsConfirmation) {
        setMode('signIn');
        setMessage({ text: 'Account created. Check your email and tap the confirmation link, then sign in here.', error: false });
      } else if (router.canGoBack()) router.back();
    }
  };

  return (
    <Screen
      title={mode === 'signIn' ? 'Sign in' : 'Create account'}
      subtitle="Optional. Back up your profile and food log, use the app on several devices, and report restaurant oils."
    >
      <View style={styles.segment}>
        {(['signIn', 'signUp'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMode(m);
              setMessage(null);
            }}
            style={[styles.segmentOption, mode === m && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, mode === m && styles.segmentTextOn]}>{m === 'signIn' ? 'Sign in' : 'Create account'}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          accessibilityLabel="Email"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          onSubmitEditing={submit}
          accessibilityLabel="Password"
        />
        {mode === 'signUp' ? <Text style={styles.small}>At least {MIN_PASSWORD} characters.</Text> : null}
      </View>
      {message ? <Text style={[styles.message, message.error ? styles.error : styles.success]}>{message.text}</Text> : null}
      <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy} accessibilityRole="button">
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>}
      </Pressable>
      <Text style={styles.small}>Your data on this device is added to your account when you sign in.</Text>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.later} accessibilityRole="button">
        <Text style={styles.laterText}>Not now — back to the app</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  email: { fontSize: 16, fontWeight: '700', color: colors.text },
  status: { fontSize: 13, color: colors.primary },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  small: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  segment: { flexDirection: 'row', backgroundColor: '#EEF1EF', borderRadius: 10, padding: 3 },
  segmentOption: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  segmentOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.text,
  },
  message: { fontSize: 14, lineHeight: 20 },
  error: { color: '#B42318' },
  success: { color: colors.primary },
  primary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  danger: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.md },
  dangerTitle: { fontSize: 15, fontWeight: '700', color: '#B42318' },
  dangerButton: { backgroundColor: '#B42318', borderColor: '#B42318' },
  later: { alignItems: 'center', paddingVertical: spacing.sm },
  laterText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  secondary: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  secondaryText: { color: '#B42318', fontSize: 15, fontWeight: '700' },
});
