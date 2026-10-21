import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { avoidLabel } from '../../components/food/FoodBadges';
import { colors, spacing } from '../../constants/theme';
import { useFoodLog } from '../../lib/food/FoodLogContext';
import { MEALS, localDate, mealForNow, type FoodApiResponse, type FoodSearchHit, type LogSource, type Meal } from '../../lib/food/types';
import { AVOID_CATEGORIES, type AvoidKey } from '../../lib/profile/options';

// /food/add?mode=search|manual&meal=lunch&date=YYYY-MM-DD[&name=…&source=restaurant&flags=seedOils,addedSugar]
type Mode = 'search' | 'manual';

const AVOID_KEYS = AVOID_CATEGORIES.map((c) => c.value) as AvoidKey[];

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ mode?: string; meal?: string; date?: string; name?: string; source?: string; flags?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'manual' ? 'manual' : 'search');
  const meal = (MEALS.some((m) => m.value === params.meal) ? params.meal : mealForNow()) as Meal;
  const date = params.date || localDate();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.segment}>
        {(['search', 'manual'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.segmentOption, mode === m && styles.segmentOn]}>
            <Text style={[styles.segmentText, mode === m && styles.segmentTextOn]}>{m === 'search' ? 'Search foods' : 'Quick add'}</Text>
          </Pressable>
        ))}
      </View>
      {mode === 'search' ? (
        <SearchPanel meal={meal} date={date} />
      ) : (
        <ManualPanel
          meal={meal}
          date={date}
          initialName={params.name ?? ''}
          source={params.source === 'restaurant' ? 'restaurant' : 'manual'}
          initialFlags={(params.flags ?? '').split(',').filter((f): f is AvoidKey => (AVOID_KEYS as string[]).includes(f))}
        />
      )}
    </ScrollView>
  );
}

function SearchPanel({ meal, date }: { meal: Meal; date: string }) {
  const router = useRouter();
  const { recent, add } = useFoodLog();
  const [query, setQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'error'; message?: string; hits: FoodSearchHit[] }>({ status: 'idle', hits: [] });

  // Search as you type, after a short pause.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setState({ status: 'idle', hits: [] });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    const t = setTimeout(async () => {
      try {
        const data = (await (await fetch(`/api/food?${new URLSearchParams({ q })}`)).json()) as FoodApiResponse;
        if (cancelled) return;
        if ('hits' in data) setState({ status: 'idle', hits: data.hits });
        else setState({ status: 'error', message: 'message' in data ? data.message : 'Search failed.', hits: [] });
      } catch {
        if (!cancelled) setState({ status: 'error', message: 'Could not reach the app server.', hits: [] });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const openProduct = (code: string) => router.push({ pathname: '/food/product', params: { barcode: code, meal, date } });
  const recentFoods = recent();

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.inputBare}
          value={query}
          onChangeText={setQuery}
          placeholder="Search packaged foods, e.g. greek yogurt"
          placeholderTextColor={colors.textMuted}
          autoFocus
          accessibilityLabel="Search foods"
        />
        {state.status === 'loading' ? <ActivityIndicator color={colors.primary} /> : null}
      </View>

      <View style={styles.barcodeRow}>
        <View style={[styles.inputWrap, { flex: 1 }]}>
          <Ionicons name="barcode-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.inputBare}
            value={barcode}
            onChangeText={(t) => setBarcode(t.replace(/\D/g, ''))}
            placeholder="Or type a barcode number"
            placeholderTextColor={colors.textMuted}
            inputMode="numeric"
            keyboardType="number-pad"
            onSubmitEditing={() => barcode && openProduct(barcode)}
            accessibilityLabel="Barcode number"
          />
        </View>
        {Platform.OS !== 'web' ? (
          <Pressable style={styles.iconButton} onPress={() => router.push({ pathname: '/food/scan', params: { meal, date } })} accessibilityLabel="Scan barcode">
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <Pressable style={[styles.iconButton, !barcode && { opacity: 0.4 }]} disabled={!barcode} onPress={() => openProduct(barcode)} accessibilityLabel="Look up barcode">
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {state.status === 'error' ? <Text style={styles.error}>{state.message}</Text> : null}

      {query.trim().length >= 2 ? (
        state.hits.length ? (
          <View style={styles.list}>
            {state.hits.map((h, i) => (
              <Pressable key={h.barcode} onPress={() => openProduct(h.barcode)} style={[styles.row, i > 0 && styles.rowBorder]}>
                {h.imageUrl ? <Image source={{ uri: h.imageUrl }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbEmpty]} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {h.name}
                  </Text>
                  <Text style={styles.rowMeta}>{[h.brand, h.kcalPer100g != null ? `${h.kcalPer100g} kcal / 100 g` : null].filter(Boolean).join(' · ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : state.status === 'idle' ? (
          <Text style={styles.hint}>No products found. Try different words, or use Quick add.</Text>
        ) : null
      ) : recentFoods.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Recent — tap to add again</Text>
          <View style={styles.list}>
            {recentFoods.map((e, i) => (
              <Pressable
                key={e.id}
                style={[styles.row, i > 0 && styles.rowBorder]}
                onPress={() => {
                  const { id: _id, createdAt: _c, ...rest } = e;
                  add({ ...rest, date, meal });
                  router.back();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{e.name}</Text>
                  <Text style={styles.rowMeta}>{[e.brand, e.amountLabel, `${Math.round(e.nutrients.kcal)} kcal`].filter(Boolean).join(' · ')}</Text>
                </View>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.hint}>Search a packaged food or type its barcode. For meals out or home cooking, use Quick add.</Text>
      )}
      <Text style={styles.credit}>Product data from Open Food Facts (community-run, may be incomplete).</Text>
    </View>
  );
}

function ManualPanel(props: { meal: Meal; date: string; initialName: string; source: LogSource; initialFlags: AvoidKey[] }) {
  const router = useRouter();
  const { add } = useFoodLog();
  const [name, setName] = useState(props.initialName);
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [meal, setMeal] = useState<Meal>(props.meal);
  const [flags, setFlags] = useState<AvoidKey[]>(props.initialFlags);

  const n = (s: string) => (s && Number.isFinite(Number(s)) ? Number(s) : 0);
  const valid = name.trim().length > 0 && n(kcal) > 0;

  const save = () => {
    add({
      date: props.date,
      meal,
      name: name.trim(),
      brand: null,
      amountLabel: null,
      nutrients: { kcal: n(kcal), protein: n(protein), carbs: n(carbs), fat: n(fat) },
      flags,
      source: props.source,
      barcode: null,
    });
    router.back();
  };

  const field = (label: string, value: string, set: (s: string) => void, unit: string) => (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.inputBare}
          value={value}
          onChangeText={(t) => set(t.replace(/[^\d.]/g, ''))}
          inputMode="decimal"
          keyboardType="decimal-pad"
          accessibilityLabel={label}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      {props.source === 'restaurant' ? (
        <Text style={styles.hint}>Restaurants rarely publish exact numbers — a rough estimate is fine.</Text>
      ) : null}
      <View style={{ gap: 4 }}>
        <Text style={styles.fieldLabel}>What did you eat?</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.inputBare}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Steak salad"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Food name"
          />
        </View>
      </View>
      <View style={styles.fieldRow}>{field('Calories', kcal, setKcal, 'kcal')}</View>
      <View style={styles.fieldRow}>
        {field('Protein', protein, setProtein, 'g')}
        {field('Carbs', carbs, setCarbs, 'g')}
        {field('Fat', fat, setFat, 'g')}
      </View>

      <Text style={styles.fieldLabel}>Meal</Text>
      <View style={styles.chips}>
        {MEALS.map((m) => (
          <Pressable key={m.value} onPress={() => setMeal(m.value)} style={[styles.chip, meal === m.value && styles.chipOn]}>
            <Text style={[styles.chipText, meal === m.value && styles.chipTextOn]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Did it contain any of these?</Text>
      <View style={styles.chips}>
        {AVOID_KEYS.map((k) => {
          const on = flags.includes(k);
          return (
            <Pressable key={k} onPress={() => setFlags(on ? flags.filter((f) => f !== k) : [...flags, k])} style={[styles.chip, on && styles.chipFlag]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{avoidLabel(k)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.primary, !valid && { opacity: 0.4 }]} disabled={!valid} onPress={save} accessibilityRole="button">
        <Text style={styles.primaryText}>Add to {MEALS.find((m) => m.value === meal)?.label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 700, width: '100%', alignSelf: 'center' },
  segment: { flexDirection: 'row', backgroundColor: '#EEF1EF', borderRadius: 10, padding: 3 },
  segmentOption: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  segmentOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputBare: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text, minWidth: 0 },
  unit: { fontSize: 14, color: colors.textMuted },
  barcodeRow: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: 44, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textMuted },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F1F3F2' },
  thumbEmpty: {},
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  hint: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  error: { fontSize: 14, color: '#B42318' },
  credit: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  fieldRow: { flexDirection: 'row', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipFlag: { backgroundColor: '#B42318', borderColor: '#B42318' },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextOn: { color: '#FFFFFF' },
  primary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
