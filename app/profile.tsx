import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import type { StepId } from '../components/setup/steps';
import { colors, spacing } from '../constants/theme';
import {
  ACTIVITY_LEVELS,
  ALLERGIES,
  AVOID_CATEGORIES,
  DAYS_EAT_OUT,
  DECISION_FACTORS,
  EATING_OUT_CHALLENGES,
  EATING_STYLES,
  FOOD_CATEGORIES,
  GENDERS,
  GOALS,
  RESTAURANTS,
  TIMELINES,
  labelFor,
  labelsFor,
} from '../lib/profile/options';
import { useAuth } from '../lib/cloud/AuthContext';
import { remindersSupported, requestReminderPermission } from '../lib/learn/tipReminders';
import { useProfile } from '../lib/profile/ProfileContext';
import { ageFromBirthYear, formatHeight, formatWeight, type Profile } from '../lib/profile/types';

type Row = { step: StepId; label: string; value: (p: Profile) => string | null };

const REMINDER_HOURS: { hour: number | null; label: string }[] = [
  { hour: null, label: 'Off' },
  { hour: 7, label: '7 AM' },
  { hour: 8, label: '8 AM' },
  { hour: 12, label: '12 PM' },
  { hour: 18, label: '6 PM' },
  { hour: 20, label: '8 PM' },
];

const list = (items: string[]) => (items.length ? items.join(', ') : null);

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Basics',
    rows: [
      { step: 'goal', label: 'Goal', value: (p) => labelFor(GOALS, p.goal) },
      { step: 'eatingStyle', label: 'Eating style', value: (p) => labelFor(EATING_STYLES, p.eatingStyle) },
      { step: 'avoid', label: 'Avoiding', value: (p) => list(labelsFor(AVOID_CATEGORIES, p.avoid)) },
      { step: 'allergies', label: 'Allergies', value: (p) => list(labelsFor(ALLERGIES, p.allergies)) ?? 'None' },
      {
        step: 'location',
        label: 'Location',
        value: (p) => (p.location === 'granted' ? 'Allowed' : p.location === 'denied' ? 'Blocked' : p.location === 'skipped' ? 'Not now' : null),
      },
    ],
  },
  {
    title: 'Body & goals',
    rows: [
      {
        step: 'body',
        label: 'Body stats',
        value: (p) =>
          [labelFor(GENDERS, p.gender), p.birthYear ? `${ageFromBirthYear(p.birthYear)} yrs` : null, formatHeight(p.heightCm, p.units), formatWeight(p.weightKg, p.units)].filter(Boolean).join(' · ') ||
          null,
      },
      { step: 'activity', label: 'Activity', value: (p) => labelFor(ACTIVITY_LEVELS, p.activity) },
      {
        step: 'timeline',
        label: 'Timeline',
        value: (p) =>
          [labelFor(TIMELINES, p.timeline), p.targetWeightKg ? `target ${formatWeight(p.targetWeightKg, p.units)}` : null]
            .filter(Boolean)
            .join(' · ') || null,
      },
    ],
  },
  {
    title: 'Eating out',
    rows: [
      { step: 'daysEatOut', label: 'Eats out', value: (p) => labelFor(DAYS_EAT_OUT, p.daysEatOut) },
      { step: 'challenges', label: 'Hardest part', value: (p) => list(labelsFor(EATING_OUT_CHALLENGES, p.eatingOutChallenges)) },
      { step: 'decide', label: 'Decides by', value: (p) => list(labelsFor(DECISION_FACTORS, p.decisionFactors)) },
      { step: 'favorites', label: 'Go-to restaurants', value: (p) => list(labelsFor(RESTAURANTS, p.favoriteRestaurants)) },
    ],
  },
  {
    title: 'Food preferences',
    rows: [
      { step: 'likes', label: 'Enjoys', value: (p) => list(labelsFor(FOOD_CATEGORIES, p.likedFoods)) },
      { step: 'dislikes', label: "Doesn't like", value: (p) => list(labelsFor(FOOD_CATEGORIES, p.dislikedFoods)) },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, reset, update } = useProfile();
  const { configured, user } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const [reminderNote, setReminderNote] = useState<string | null>(null);

  const setReminder = async (hour: number | null) => {
    if (hour != null && !(await requestReminderPermission())) {
      setReminderNote('Notifications are blocked. Turn them on in your phone settings to get daily tips.');
      return;
    }
    setReminderNote(null);
    update({ tipReminderHour: hour });
  };

  const edit = (step: StepId) => router.push({ pathname: '/setup', params: { mode: 'edit', step } });

  return (
    <Screen title="Profile & Settings" subtitle="Tap any answer to change it. Saved on this device.">
      {configured ? (
        <Pressable style={styles.accountRow} onPress={() => router.push('/account')} accessibilityRole="button">
          <Ionicons name={user ? 'cloud-done-outline' : 'cloud-upload-outline'} size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{user ? 'Account' : 'Back up your data'}</Text>
            <Text style={styles.bannerText}>{user ? `Signed in as ${user.email} · synced` : 'Sign in or create an account to sync across devices'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {!profile.personalizeComplete ? (
        <Pressable style={styles.banner} onPress={() => router.push({ pathname: '/setup', params: { mode: 'more' } })}>
          <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Personalize more</Text>
            <Text style={styles.bannerText}>Body stats, go-to restaurants and food likes — about 2 minutes.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.rows.map((row, i) => {
              const value = row.value(profile);
              return (
                <Pressable key={row.step} onPress={() => edit(row.step)} style={[styles.row, i > 0 && styles.rowBorder]} accessibilityRole="button">
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={[styles.rowValue, !value && styles.rowEmpty]} numberOfLines={2}>
                      {value ?? 'Not set'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily tip notification</Text>
        <View style={[styles.card, { padding: spacing.md, gap: spacing.sm }]}>
          {remindersSupported ? (
            <>
              <Text style={styles.rowLabel}>One longevity tip a day, at the time you choose.</Text>
              <View style={styles.hours}>
                {REMINDER_HOURS.map((h) => {
                  const on = profile.tipReminderHour === h.hour;
                  return (
                    <Pressable key={h.label} onPress={() => setReminder(h.hour)} style={[styles.hour, on && styles.hourOn]} accessibilityState={{ selected: on }}>
                      <Text style={[styles.hourText, on && styles.hourTextOn]}>{h.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {reminderNote ? <Text style={styles.resetText}>{reminderNote}</Text> : null}
            </>
          ) : (
            <Text style={styles.rowLabel}>Daily tip notifications work in the phone app. On the web, today's tip is on the Home and Learn tabs.</Text>
          )}
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This app provides general wellness information and is not medical advice. Talk to a qualified health
        professional before making major changes to your diet or health routine.
      </Text>

      <Pressable
        onPress={() => {
          if (!confirmReset) return setConfirmReset(true);
          reset();
          router.replace({ pathname: '/setup', params: { mode: 'quick' } });
        }}
        style={styles.reset}
      >
        <Text style={styles.resetText}>{confirmReset ? 'Tap again to erase all answers and start over' : 'Start over'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  bannerText: { fontSize: 13, color: colors.textMuted },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { fontSize: 13, color: colors.textMuted },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
  rowEmpty: { color: colors.textMuted, fontStyle: 'italic', fontWeight: '400' },
  hours: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hour: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border },
  hourOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  hourText: { fontSize: 13, fontWeight: '600', color: colors.text },
  hourTextOn: { color: '#FFFFFF' },
  disclaimer: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  reset: { alignItems: 'center', paddingVertical: spacing.sm },
  resetText: { color: '#B54708', fontWeight: '600' },
});
