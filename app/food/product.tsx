import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RATING_STYLE, RatingBadge, avoidLabel } from '../../components/food/FoodBadges';
import { colors, spacing } from '../../constants/theme';
import { rateFood } from '../../lib/food/avoidCheck';
import { useFoodLog } from '../../lib/food/FoodLogContext';
import { articleForFlag } from '../../lib/learn/links';
import { MEALS, localDate, mealForNow, type FoodApiResponse, type FoodProduct, type Meal, type Nutrients } from '../../lib/food/types';
import type { AvoidKey } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';

// /food/product?barcode=…&meal=…&date=…
type Unit = 'serving' | 'g';

const scale = (n: Nutrients, factor: number): Nutrients => ({
  kcal: Math.round(n.kcal * factor),
  protein: Math.round(n.protein * factor * 10) / 10,
  carbs: Math.round(n.carbs * factor * 10) / 10,
  fat: Math.round(n.fat * factor * 10) / 10,
});

export default function ProductScreen() {
  const params = useLocalSearchParams<{ barcode?: string; meal?: string; date?: string }>();
  const router = useRouter();
  const { profile } = useProfile();
  const { add } = useFoodLog();
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'not_found' | 'error'; product?: FoodProduct; message?: string }>({
    status: 'loading',
  });
  const [unit, setUnit] = useState<Unit>('serving');
  const [amount, setAmount] = useState('1');
  const [meal, setMeal] = useState<Meal>((MEALS.some((m) => m.value === params.meal) ? params.meal : mealForNow()) as Meal);
  const [showIngredients, setShowIngredients] = useState(false);

  useEffect(() => {
    if (!params.barcode) return setState({ status: 'error', message: 'No barcode given.' });
    (async () => {
      try {
        const data = (await (await fetch(`/api/food?barcode=${encodeURIComponent(params.barcode!)}`)).json()) as FoodApiResponse;
        if ('product' in data) {
          setState({ status: 'ready', product: data.product });
          if (!data.product.servingGrams) {
            setUnit('g');
            setAmount('100');
          }
        } else if ('error' in data && data.error === 'not_found') setState({ status: 'not_found' });
        else setState({ status: 'error', message: 'message' in data ? data.message : 'Could not load this product.' });
      } catch {
        setState({ status: 'error', message: 'Could not reach the app server.' });
      }
    })();
  }, [params.barcode]);

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (state.status !== 'ready' || !state.product) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{state.status === 'not_found' ? 'Not in the database yet' : 'Something went wrong'}</Text>
        <Text style={styles.muted}>
          {state.status === 'not_found'
            ? `Barcode ${params.barcode} isn't in Open Food Facts. You can still log it with your own numbers.`
            : state.message}
        </Text>
        <Pressable
          style={styles.primary}
          onPress={() => router.replace({ pathname: '/food/add', params: { mode: 'manual', meal, date: params.date ?? localDate() } })}
        >
          <Text style={styles.primaryText}>Add it manually</Text>
        </Pressable>
      </View>
    );
  }

  const p = state.product;
  const { rating, flagged } = rateFood(p.found, profile.avoid);
  const other = (Object.keys(p.found) as AvoidKey[]).filter((k) => !profile.avoid.includes(k));
  const qty = Number(amount) > 0 ? Number(amount) : 0;
  const grams = unit === 'serving' ? qty * (p.servingGrams ?? 0) : qty;
  const nutrients = p.per100g ? scale(p.per100g, grams / 100) : null;
  const amountLabel = unit === 'serving' ? `${qty} ${qty === 1 ? 'serving' : 'servings'}${p.servingGrams ? ` (${Math.round(grams)} g)` : ''}` : `${qty} g`;

  const logIt = () => {
    if (!nutrients) return;
    add({
      date: params.date ?? localDate(),
      meal,
      name: p.name,
      brand: p.brand,
      amountLabel,
      nutrients,
      flags: Object.keys(p.found) as AvoidKey[],
      source: 'search',
      barcode: p.barcode,
    });
    router.navigate('/tracker');
  };

  const ratingText =
    rating === 'good'
      ? 'Nothing from your avoid list was found in the ingredients.'
      : `Contains ${flagged.length === 1 ? 'something' : `${flagged.length} things`} from your avoid list.`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {p.imageUrl ? <Image source={{ uri: p.imageUrl }} style={styles.image} resizeMode="contain" /> : null}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title}>{p.name}</Text>
          {p.brand ? <Text style={styles.muted}>{p.brand}</Text> : null}
        </View>
      </View>

      <View style={[styles.ratingCard, { backgroundColor: RATING_STYLE[rating].bg }]}>
        <RatingBadge rating={rating} large />
        <Text style={styles.ratingText}>{ratingText}</Text>
        {flagged.map((k) => {
          const slug = articleForFlag(k, p.found[k]);
          return (
            <View key={k} style={styles.flagRow}>
              <Text style={styles.flagTitle}>{avoidLabel(k)}</Text>
              <Text style={styles.flagDetail}>{p.found[k]!.join(', ')}</Text>
              {slug ? (
                <Text style={styles.link} onPress={() => router.push({ pathname: '/learn/[slug]', params: { slug } })}>
                  Learn why ›
                </Text>
              ) : null}
            </View>
          );
        })}
        {!p.ingredientsText ? <Text style={styles.small}>No ingredient list in the database, so this check may be incomplete.</Text> : null}
        {other.length ? <Text style={styles.small}>Also contains (not on your list): {other.map(avoidLabel).join(', ')}</Text> : null}
      </View>

      {p.ingredientsText ? (
        <Pressable onPress={() => setShowIngredients((s) => !s)}>
          <Text style={styles.link}>{showIngredients ? 'Hide ingredients' : 'Show ingredients'}</Text>
          {showIngredients ? <Text style={styles.ingredients}>{p.ingredientsText}</Text> : null}
        </Pressable>
      ) : null}

      {p.per100g ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How much?</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              keyboardType="decimal-pad"
              accessibilityLabel="Amount"
            />
            <View style={styles.segment}>
              {p.servingGrams ? (
                <Pressable
                  onPress={() => {
                    setUnit('serving');
                    setAmount('1');
                  }}
                  style={[styles.segmentOption, unit === 'serving' && styles.segmentOn]}
                >
                  <Text style={[styles.segmentText, unit === 'serving' && styles.segmentTextOn]}>servings</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => {
                  setUnit('g');
                  setAmount(p.servingGrams ? String(Math.round(p.servingGrams)) : '100');
                }}
                style={[styles.segmentOption, unit === 'g' && styles.segmentOn]}
              >
                <Text style={[styles.segmentText, unit === 'g' && styles.segmentTextOn]}>grams</Text>
              </Pressable>
            </View>
          </View>
          {p.servingLabel ? <Text style={styles.small}>1 serving = {p.servingLabel}</Text> : null}
          {nutrients ? (
            <View style={styles.nutrients}>
              <Nutrient label="Calories" value={`${nutrients.kcal}`} />
              <Nutrient label="Protein" value={`${nutrients.protein} g`} />
              <Nutrient label="Carbs" value={`${nutrients.carbs} g`} />
              <Nutrient label="Fat" value={`${nutrients.fat} g`} />
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Meal</Text>
          <View style={styles.chips}>
            {MEALS.map((m) => (
              <Pressable key={m.value} onPress={() => setMeal(m.value)} style={[styles.chip, meal === m.value && styles.chipOn]}>
                <Text style={[styles.chipText, meal === m.value && styles.chipTextOn]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.primary, !qty && { opacity: 0.4 }]} disabled={!qty} onPress={logIt} accessibilityRole="button">
            <Text style={styles.primaryText}>Log it</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.muted}>No nutrition facts for this product in the database.</Text>
          <Pressable
            style={styles.primary}
            onPress={() => router.replace({ pathname: '/food/add', params: { mode: 'manual', meal, date: params.date ?? localDate(), name: p.name } })}
          >
            <Text style={styles.primaryText}>Log with my own numbers</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.credit}>Data from Open Food Facts. Ratings check ingredients against your avoid list — not medical advice.</Text>
    </ScrollView>
  );
}

function Nutrient({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrient}>
      <Text style={styles.nutrientValue}>{value}</Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 700, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  image: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted, textAlign: 'left' },
  ratingCard: { borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  ratingText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  flagRow: { gap: 1 },
  flagTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  flagDetail: { fontSize: 13, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
  ingredients: { fontSize: 13, color: colors.text, lineHeight: 19, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  amountRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  amountInput: {
    width: 90,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  segment: { flexDirection: 'row', backgroundColor: '#EEF1EF', borderRadius: 10, padding: 3 },
  segmentOption: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  segmentOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text },
  nutrients: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  nutrient: { alignItems: 'center', flex: 1 },
  nutrientValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  nutrientLabel: { fontSize: 12, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextOn: { color: '#FFFFFF' },
  primary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, paddingHorizontal: spacing.lg, alignItems: 'center', marginTop: spacing.sm },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  credit: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
});
