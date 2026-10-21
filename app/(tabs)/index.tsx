import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, Link, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { avoidLabel } from '../../components/food/FoodBadges';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../lib/cloud/AuthContext';
import { sumNutrients, useFoodLog } from '../../lib/food/FoodLogContext';
import { computeTargets } from '../../lib/food/targets';
import { localDate, mealForNow } from '../../lib/food/types';
import { tipForDate } from '../../lib/learn/tips';
import { GOALS, RESTAURANTS, labelFor, type AvoidKey } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

type Action = { icon: keyof typeof Ionicons.glyphMap; label: string; href: Href };

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { forDate } = useFoodLog();
  const { configured, user } = useAuth();

  const today = forDate(localDate());
  const eaten = Math.round(sumNutrients(today).kcal);
  const result = computeTargets(profile, profile.calorieTargetOverride);
  const target = result.ok ? result.targets.calories : null;
  const tip = tipForDate(profile);

  const avoidCounts = new Map<AvoidKey, number>();
  for (const e of today) for (const f of e.flags) if (profile.avoid.includes(f)) avoidCounts.set(f, (avoidCounts.get(f) ?? 0) + 1);
  const avoidLine = !today.length
    ? 'Nothing logged yet today'
    : avoidCounts.size
      ? [...avoidCounts].map(([k, n]) => `${avoidLabel(k)}: ${n}`).join(' · ')
      : 'Nothing from your avoid list today';

  const meal = mealForNow();
  const actions: Action[] = [
    { icon: 'barcode-outline', label: 'Scan', href: { pathname: '/food/scan', params: { meal, date: localDate() } } },
    { icon: 'add-circle-outline', label: 'Log food', href: { pathname: '/food/add', params: { mode: 'search', meal, date: localDate() } } },
    { icon: 'location-outline', label: 'Find food', href: '/nearby' },
    { icon: 'flask-outline', label: 'Learn', href: '/learn' },
  ];

  const favorites = RESTAURANTS.filter((r) => profile.favoriteRestaurants.includes(r.value));
  const goal = labelFor(GOALS, profile.goal);

  return (
    <Screen title={greeting()} subtitle={goal ? `Goal: ${goal}` : 'Your health, wellness and longevity hub.'}>
      <Link href="/tracker" asChild>
        <Pressable style={styles.today} accessibilityRole="button" accessibilityLabel="Open calorie tracker">
          <View style={styles.todayTop}>
            <Text style={styles.todayLabel}>Today</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primarySoft} />
          </View>
          <Text style={styles.todayValue}>
            {eaten}
            <Text style={styles.todayUnit}>{target ? ` / ${target} kcal` : ' kcal'}</Text>
          </Text>
          {target ? (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(eaten / target, 1) * 100}%` }]} />
            </View>
          ) : (
            <Text style={styles.todayHint}>Add your body stats in Profile to get a daily target.</Text>
          )}
          <View style={styles.avoidRow}>
            <Ionicons name={avoidCounts.size ? 'alert-circle-outline' : 'shield-checkmark-outline'} size={16} color="#FFFFFF" />
            <Text style={styles.avoidText}>{avoidLine}</Text>
          </View>
        </Pressable>
      </Link>

      <View style={styles.actions}>
        {actions.map((a) => (
          <Link key={a.label} href={a.href} asChild>
            <Pressable style={styles.action} accessibilityRole="button">
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {!profile.personalizeComplete ? (
        <Link href={{ pathname: '/setup', params: { mode: 'more' } }} asChild>
          <Pressable style={styles.nudge}>
            <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
            <View style={styles.nudgeText}>
              <Text style={styles.cardTitle}>Finish personalizing</Text>
              <Text style={styles.cardDescription}>Body stats and go-to restaurants for better recommendations. About 2 minutes.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </Link>
      ) : null}

      <Link href={{ pathname: '/learn/[slug]', params: { slug: tip.article } }} asChild>
        <Pressable style={styles.tip}>
          <View style={styles.tipHead}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.tipLabel}>Today's tip</Text>
          </View>
          <Text style={styles.tipText}>{tip.text}</Text>
          <Text style={styles.tipLink}>Read why ›</Text>
        </Pressable>
      </Link>

      {favorites.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>What to order at your go-to spots</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favorites}>
            {favorites.map((r) => (
              <Pressable
                key={r.value}
                style={styles.favorite}
                onPress={() => router.push({ pathname: '/guide/[restaurant]', params: { restaurant: r.value } })}
                accessibilityRole="link"
                accessibilityLabel={`What to order at ${r.label}`}
              >
                {r.image ? <Image source={{ uri: r.image }} style={styles.favoriteLogo} /> : null}
                <Text style={styles.favoriteName} numberOfLines={1}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {configured && !user ? (
        <Link href="/account" asChild>
          <Pressable style={styles.nudge}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
            <View style={styles.nudgeText}>
              <Text style={styles.cardTitle}>Back up your data</Text>
              <Text style={styles.cardDescription}>Create a free account to sync your profile and food log across devices.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </Link>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  today: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, gap: spacing.sm },
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLabel: { color: colors.primarySoft, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  todayValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  todayUnit: { fontSize: 16, fontWeight: '600', color: colors.primarySoft },
  todayHint: { color: colors.primarySoft, fontSize: 13 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  avoidRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  avoidText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.text },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.md,
  },
  nudgeText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDescription: { fontSize: 14, color: colors.textMuted },
  tip: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipLabel: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  tipText: { fontSize: 15, lineHeight: 22, color: colors.text },
  tipLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  favorites: { gap: spacing.sm },
  favorite: {
    width: 96,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  favoriteLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF' },
  favoriteName: { fontSize: 12, fontWeight: '600', color: colors.text },
});
