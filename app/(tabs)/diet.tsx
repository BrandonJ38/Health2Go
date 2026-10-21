import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GuideBadge } from '../../components/guides/GuideBadge';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { buildDietPlan } from '../../lib/diet/builder';
import { GROUP_LABEL } from '../../lib/diet/foods';
import { computeTargets } from '../../lib/food/targets';
import { guideFor } from '../../lib/guides/guides';
import { EATING_STYLES, GOALS, RESTAURANTS, labelFor } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';

const MEALS_PER_DAY = 3;

function RestaurantRow({ value }: { value: string }) {
  const info = RESTAURANTS.find((r) => r.value === value)!;
  const guide = guideFor(value);
  if (!guide) return null;
  return (
    <Link href={{ pathname: '/guide/[restaurant]', params: { restaurant: value } }} asChild>
      <Pressable style={styles.restaurant} accessibilityRole="link">
        {info.image ? <Image source={{ uri: info.image }} style={styles.logo} /> : null}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.restaurantName}>{info.label}</Text>
          <GuideBadge verdict={guide.verdict} />
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

export default function DietScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const plan = buildDietPlan(profile);
  const result = computeTargets(profile, profile.calorieTargetOverride);
  const others = RESTAURANTS.filter((r) => !profile.favoriteRestaurants.includes(r.value));

  const chips = [
    labelFor(GOALS, profile.goal),
    profile.eatingStyle && profile.eatingStyle !== 'none' ? labelFor(EATING_STYLES, profile.eatingStyle) : null,
    profile.avoid.length ? `Avoiding ${profile.avoid.length}` : null,
    profile.allergies.length ? `${profile.allergies.length} allerg${profile.allergies.length === 1 ? 'y' : 'ies'}` : null,
  ].filter((c): c is string => !!c);

  return (
    <Screen title="Diet Builder" subtitle="Your food plan, built from your goals, eating style and avoid list.">
      <View style={styles.chips}>
        {chips.map((c) => (
          <View key={c} style={styles.chip}>
            <Text style={styles.chipText}>{c}</Text>
          </View>
        ))}
        <Pressable onPress={() => router.push('/profile')}>
          <Text style={styles.link}>Edit answers</Text>
        </Pressable>
      </View>

      <View style={styles.targets}>
        <Text style={styles.targetsLabel}>Daily targets</Text>
        {result.ok ? (
          <>
            <Text style={styles.targetsBig}>{result.targets.calories} kcal</Text>
            <Text style={styles.targetsMacros}>
              Protein {result.targets.protein} g · Carbs {result.targets.carbs} g · Fat {result.targets.fat} g
            </Text>
            <Text style={styles.targetsHint}>
              That's about {Math.round(result.targets.protein / MEALS_PER_DAY)} g of protein per meal across {MEALS_PER_DAY} meals.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.targetsHint}>Add your {result.missing.join(', ')} to get calorie and macro targets.</Text>
            <Pressable style={styles.targetsButton} onPress={() => router.push({ pathname: '/setup', params: { mode: 'edit', step: 'body' } })}>
              <Text style={styles.targetsButtonText}>Add body stats</Text>
            </Pressable>
          </>
        )}
      </View>

      {plan.focus.map((f) => (
        <Text key={f} style={styles.focus}>
          {f}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Eat more of these</Text>
      {plan.eatMore.map((g) => (
        <View key={g.group} style={styles.card}>
          <Text style={styles.cardTitle}>{GROUP_LABEL[g.group]}</Text>
          {g.foods.map((f) => (
            <View key={f.id} style={styles.food}>
              <Text style={styles.foodName}>
                {f.name}
                {f.liked ? <Text style={styles.liked}>  ★ you like this</Text> : null}
              </Text>
              <Text style={styles.foodReason}>{f.note ? `${f.reason} · ${f.note}` : f.reason}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Limit or avoid</Text>
      <View style={styles.card}>
        {plan.limit.map((l) => (
          <View key={l.label} style={styles.food}>
            <Text style={styles.foodName}>{l.label}</Text>
            <Text style={styles.foodReason}>{l.reason}</Text>
            {l.article ? (
              <Text style={styles.link} onPress={() => router.push({ pathname: '/learn/[slug]', params: { slug: l.article! } })}>
                Learn why ›
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Eating out</Text>
      {profile.favoriteRestaurants.length ? (
        <View style={styles.list}>
          {profile.favoriteRestaurants.map((r) => (
            <RestaurantRow key={r} value={r} />
          ))}
        </View>
      ) : (
        <Pressable onPress={() => router.push({ pathname: '/setup', params: { mode: 'edit', step: 'favorites' } })}>
          <Text style={styles.focus}>
            Pick your go-to restaurants to see what to order at each one. <Text style={styles.link}>Choose restaurants ›</Text>
          </Text>
        </Pressable>
      )}
      <Pressable onPress={() => setShowAllRestaurants((s) => !s)}>
        <Text style={styles.link}>{showAllRestaurants ? 'Hide other restaurants' : `Other restaurant guides (${others.length})`}</Text>
      </Pressable>
      {showAllRestaurants ? (
        <View style={styles.list}>
          {others.map((r) => (
            <RestaurantRow key={r.value} value={r.value} />
          ))}
        </View>
      ) : null}

      <Text style={styles.disclaimer}>General guidance, not medical advice. Talk to a professional before major diet changes, especially with a health condition.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  chip: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
  targets: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, gap: 4 },
  targetsLabel: { color: colors.primarySoft, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  targetsBig: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  targetsMacros: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  targetsHint: { color: colors.primarySoft, fontSize: 13 },
  targetsButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginTop: 4 },
  targetsButtonText: { color: colors.primary, fontWeight: '700' },
  focus: { fontSize: 14, color: colors.text, lineHeight: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  food: { gap: 2 },
  foodName: { fontSize: 15, fontWeight: '600', color: colors.text },
  liked: { fontSize: 12, fontWeight: '700', color: '#B7791F' },
  foodReason: { fontSize: 13, color: colors.textMuted },
  list: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  restaurant: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  logo: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF' },
  restaurantName: { fontSize: 15, fontWeight: '600', color: colors.text },
  disclaimer: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: spacing.sm },
});
