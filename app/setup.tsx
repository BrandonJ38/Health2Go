import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MORE_FLOW, QUICK_FLOW, STEPS, type StepId } from '../components/setup/steps';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../lib/cloud/AuthContext';
import { useProfile } from '../lib/profile/ProfileContext';

// One screen for every setup flow:
//   /setup?mode=quick            required quick start (first launch)
//   /setup?mode=more             optional "Personalize more"
//   /setup?mode=edit&step=goal   edit a single answer from Profile
type Mode = 'quick' | 'more' | 'edit';

export default function SetupScreen() {
  const params = useLocalSearchParams<{ mode?: string; step?: string }>();
  const mode: Mode = params.mode === 'more' || params.mode === 'edit' ? params.mode : 'quick';
  const flow: StepId[] =
    mode === 'edit' && params.step && params.step in STEPS ? [params.step as StepId] : mode === 'more' ? MORE_FLOW : QUICK_FLOW;
  const { loaded } = useProfile();
  // Forms copy saved answers into their fields when they first render, so wait until those are loaded.
  if (!loaded) return null;
  // Keyed so switching flows (quick → more) starts again at step 1.
  return <SetupFlow key={`${mode}:${params.step ?? ''}`} mode={mode} flow={flow} />;
}

function SetupFlow({ mode, flow }: { mode: Mode; flow: StepId[] }) {
  const router = useRouter();
  const { profile, update } = useProfile();
  const { configured, user } = useAuth();
  const [index, setIndex] = useState(0);
  const id = flow[index];
  const step = STEPS[id];

  const goHome = () => router.replace('/');

  // Signed in from the welcome screen and the account already finished onboarding → go straight to the app.
  useEffect(() => {
    if (mode === 'quick' && index === 0 && profile.onboardingComplete) router.replace('/');
  }, [mode, index, profile.onboardingComplete, router]);
  const exitEdit = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  const next = () => {
    if (mode === 'edit') return exitEdit();
    if (index < flow.length - 1) return setIndex(index + 1);
    if (mode === 'more') {
      update({ personalizeComplete: true });
      goHome();
    }
  };
  const back = () => (mode === 'edit' ? exitEdit() : index > 0 ? setIndex(index - 1) : router.canGoBack() ? router.back() : goHome());

  // Progress counts real questions only (not welcome/done).
  const questions: StepId[] = flow.filter((s) => s !== 'welcome' && s !== 'done');
  const progress = questions.indexOf(id) + 1;
  const showHeader = id !== 'welcome' && id !== 'done';

  const askLocation = async () => {
    let location: 'granted' | 'denied' = 'denied';
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      location = status === 'granted' ? 'granted' : 'denied';
    } catch {
      // Permission prompt unavailable — treat as denied; Nearby still offers city/zip search.
    }
    finishLocation(location);
  };
  const finishLocation = (location: 'granted' | 'denied' | 'skipped') => {
    // The quick start is complete once location is answered, even if they close the app on "done".
    update(mode === 'edit' ? { location } : { location, onboardingComplete: true });
    next();
  };

  const canContinue = step.canContinue ? step.canContinue(profile) : true;
  const isLast = index === flow.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {showHeader ? (
        <View style={styles.header}>
          <Pressable onPress={back} hitSlop={10} accessibilityLabel={mode === 'edit' ? 'Close' : 'Back'}>
            <Ionicons name={mode === 'edit' ? 'close' : 'chevron-back'} size={26} color={colors.text} />
          </Pressable>
          {mode !== 'edit' ? (
            <View style={styles.progressTrack} accessibilityLabel={`Step ${progress} of ${questions.length}`}>
              <View style={[styles.progressFill, { width: `${(progress / questions.length) * 100}%` }]} />
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {step.optional && mode !== 'edit' ? (
            <Pressable onPress={next} hitSlop={10}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {id === 'welcome' ? <Welcome /> : id === 'done' ? <Done personalized={profile.personalizeComplete} /> : null}
        {id === 'location' ? <LocationIntro /> : null}
        {id !== 'welcome' && id !== 'done' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.title}>{step.title}</Text>
            {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}
          </View>
        ) : null}
        {step.render ? step.render(profile, update) : null}
      </ScrollView>

      <View style={styles.footer}>
        {id === 'welcome' ? (
          <>
            <PrimaryButton label="Get started" onPress={next} />
            {configured && !user ? <SecondaryButton label="Already have an account? Sign in" onPress={() => router.push('/account')} /> : null}
          </>
        ) : id === 'location' ? (
          <>
            <PrimaryButton label="Allow location" onPress={askLocation} />
            <SecondaryButton label="Not now — I'll type a city" onPress={() => finishLocation('skipped')} />
          </>
        ) : id === 'done' ? (
          <>
            {!profile.personalizeComplete ? (
              <PrimaryButton label="Personalize more (about 2 min)" onPress={() => router.replace({ pathname: '/setup', params: { mode: 'more' } })} />
            ) : null}
            <SecondaryButton label="Start exploring" onPress={goHome} strong={profile.personalizeComplete} />
            {configured && !user ? <SecondaryButton label="Create an account to back up your data" onPress={() => router.push('/account')} /> : null}
          </>
        ) : (
          <PrimaryButton
            label={mode === 'edit' ? 'Done' : isLast ? 'Finish' : 'Continue'}
            onPress={next}
            disabled={!canContinue}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function Welcome() {
  const points: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: 'location-outline', text: 'Find seed-oil free, clean restaurants near you' },
    { icon: 'flask-outline', text: 'Learn what foods really do to your body, with sources' },
    { icon: 'nutrition-outline', text: 'Track what you eat and flag what to avoid' },
  ];
  return (
    <View style={{ gap: spacing.lg, paddingTop: spacing.lg }}>
      <View style={styles.heroIcon}>
        <Ionicons name="leaf" size={40} color={colors.primary} />
      </View>
      <Text style={styles.heroTitle}>Eat for the long run</Text>
      <Text style={styles.subtitle}>A few quick questions so everything fits you. Takes under a minute.</Text>
      <View style={{ gap: spacing.md }}>
        {points.map((p) => (
          <View key={p.text} style={styles.point}>
            <Ionicons name={p.icon} size={22} color={colors.primary} />
            <Text style={styles.pointText}>{p.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LocationIntro() {
  return (
    <View style={[styles.heroIcon, { marginTop: spacing.md }]}>
      <Ionicons name="navigate" size={36} color={colors.primary} />
    </View>
  );
}

function Done({ personalized }: { personalized: boolean }) {
  return (
    <View style={{ gap: spacing.lg, paddingTop: spacing.lg }}>
      <View style={styles.heroIcon}>
        <Ionicons name="checkmark-circle" size={44} color={colors.primary} />
      </View>
      <Text style={styles.heroTitle}>You're all set</Text>
      <Text style={styles.subtitle}>
        {personalized
          ? 'Your preferences are saved. You can change them any time in Profile.'
          : 'Want better recommendations? Tell us a bit more — body stats for your calorie target, your go-to restaurants, and the foods you like. You can also do this later from Profile.'}
      </Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.primaryDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.secondary, strong && styles.primary]} accessibilityRole="button">
      <Text style={[styles.secondaryText, strong && styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  skip: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  content: { padding: spacing.lg, gap: spacing.lg, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: colors.text },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pointText: { flex: 1, fontSize: 16, color: colors.text },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  primary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondary: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
