import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONFIDENCE_STYLE, RestaurantCard, type CommunityProps } from '../../components/nearby/RestaurantCard';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../lib/cloud/AuthContext';
import { fetchReports, submitReport, type MyVotes, type PlaceTallies } from '../../lib/cloud/reports';
import {
  ATTRIBUTE_GROUPS,
  ATTRIBUTES,
  CRITERIA,
  CRITERION_KEYS,
  type CriterionKey,
  type FilterKey,
  type NearbyResponse,
  type Restaurant,
} from '../../lib/nearby/types';
import type { AvoidKey } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';

type Area = { lat: number; lng: number; label: string } | { q: string; label: string };

type State =
  | { status: 'locating' }
  | { status: 'denied' }
  | { status: 'loading'; label: string }
  | { status: 'ready'; label: string; restaurants: Restaurant[]; refreshing?: boolean }
  | { status: 'missing_key' }
  | { status: 'error'; message: string };

const isCriterion = (k: FilterKey): k is CriterionKey => (CRITERION_KEYS as string[]).includes(k);

// Health criteria need Likely or Verified; diet/oil/sourcing filters need any sign of it.
const meets = (r: Restaurant, k: FilterKey, verifiedOnly: boolean) =>
  isCriterion(k)
    ? r.criteria[k].confidence === 'verified' || (!verifiedOnly && r.criteria[k].confidence === 'likely')
    : !!r.attributes?.[k];

// Avoid-list choices from onboarding switch on the matching filters by default.
const AVOID_TO_FILTER: Partial<Record<AvoidKey, CriterionKey>> = {
  seedOils: 'seedOilFree',
  addedSugar: 'noAddedSugar',
  ultraProcessed: 'freshIngredients',
};

const FOOD_SUGGESTIONS = ['Salad', 'Steak', 'Breakfast', 'Açaí bowl', 'Tacos', 'Smoothie', 'Seafood', 'Burger'];

export default function NearbyScreen() {
  const [state, setState] = useState<State>({ status: 'locating' });
  const [area, setArea] = useState<Area | null>(null);
  const [query, setQuery] = useState('');
  const [foodInput, setFoodInput] = useState('');
  const [food, setFood] = useState<string | null>(null); // the food search actually applied
  const { profile } = useProfile();
  const router = useRouter();
  const { configured, user } = useAuth();
  const [tallies, setTallies] = useState<Map<string, PlaceTallies>>(new Map());
  const [myVotes, setMyVotes] = useState<Map<string, MyVotes>>(new Map());
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState<FilterKey[]>(() =>
    profile.avoid.flatMap((a) => (AVOID_TO_FILTER[a] ? [AVOID_TO_FILTER[a]] : [])),
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Location is requested only when this screen is opened, never at app launch.
  const locateUser = useCallback(async () => {
    setState({ status: 'locating' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setArea({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Near you' });
    } catch {
      setState({ status: 'denied' });
    }
  }, []);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  // Re-search whenever the area or the active filters change. Each active filter adds a targeted
  // search on the server, so places that advertise it show up (results are cached for 30 min).
  useEffect(() => {
    if (!area) return;
    let cancelled = false;
    const params = new URLSearchParams('q' in area ? { q: area.q } : { lat: String(area.lat), lng: String(area.lng) });
    if (food) params.set('food', food);
    // Newest filters first — the server runs targeted searches for the first few only.
    if (filters.length) params.set('focus', [...filters].reverse().join(','));
    const label = food ? `“${food}” · ${area.label}` : area.label;

    // Keep current results on screen while new ones load.
    setState((prev) => (prev.status === 'ready' ? { ...prev, refreshing: true } : { status: 'loading', label }));
    (async () => {
      try {
        const res = await fetch(`/api/nearby?${params}`);
        const data = (await res.json()) as NearbyResponse;
        if (cancelled) return;
        if ('restaurants' in data) setState({ status: 'ready', label, restaurants: data.restaurants });
        else if (data.error === 'missing_key') setState({ status: 'missing_key' });
        else setState({ status: 'error', message: data.message ?? 'Something went wrong.' });
      } catch {
        if (!cancelled) setState({ status: 'error', message: 'Could not reach the app server.' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [area, food, filters]);

  // User reports for the restaurants on screen.
  const placeIds = state.status === 'ready' ? state.restaurants.map((r) => r.id).join(',') : '';
  useEffect(() => {
    if (!configured || !placeIds) return;
    let cancelled = false;
    fetchReports(placeIds.split(','), user?.id ?? null)
      .then(({ tallies: t, mine }) => {
        if (cancelled) return;
        setTallies(t);
        setMyVotes(mine);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [configured, placeIds, user]);

  const report = async (r: Restaurant, criterion: CriterionKey, value: boolean) => {
    if (!user) return;
    const prevVote = myVotes.get(r.id)?.[criterion];
    if (prevVote === value) return;
    // Update the counts on screen right away; roll back if saving fails.
    const before = { tallies, myVotes };
    const place = { ...tallies.get(r.id) };
    const t = { yes: 0, no: 0, ...place[criterion] };
    if (prevVote !== undefined) t[prevVote ? 'yes' : 'no']--;
    t[value ? 'yes' : 'no']++;
    setTallies(new Map(tallies).set(r.id, { ...place, [criterion]: t }));
    setMyVotes(new Map(myVotes).set(r.id, { ...myVotes.get(r.id), [criterion]: value }));
    try {
      await submitReport(r.id, r.name, criterion, value, user.id);
    } catch {
      setTallies(before.tallies);
      setMyVotes(before.myVotes);
    }
  };

  // Applies both boxes: the food search, and a typed city/zip (otherwise keeps the current area).
  const runSearch = (foodText = foodInput) => {
    setFood(foodText.trim() || null);
    const q = query.trim();
    if (q) setArea({ q, label: q });
  };

  const pickSuggestion = (s: string) => {
    setFoodInput(s);
    runSearch(s);
  };

  const clearFood = () => {
    setFoodInput('');
    setFood(null);
  };

  const toggleFilter = (key: FilterKey) =>
    setFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const moreActive = filters.filter((k) => !isCriterion(k)).length;

  const visible = useMemo(() => {
    if (state.status !== 'ready') return [];
    const matched = state.restaurants.filter((r) => {
      if (filters.length) return filters.every((k) => meets(r, k, verifiedOnly));
      // "Verified only" with no criteria selected: anything verified for at least one criterion.
      return !verifiedOnly || CRITERIA.some(({ key }) => r.criteria[key].confidence === 'verified');
    });
    // With diet/oil/sourcing filters on, explicit matches (e.g. a fully vegan restaurant) come before "likely" ones.
    const attrFilters = filters.filter((k) => !isCriterion(k));
    if (!attrFilters.length) return matched;
    const explicit = (r: Restaurant) => attrFilters.filter((k) => r.attributes?.[k as keyof Restaurant['attributes']]?.level === 'yes').length;
    return [...matched].sort((x, y) => explicit(y) - explicit(x));
  }, [state, filters, verifiedOnly]);

  return (
    <Screen title="Healthy Nearby" subtitle="Non-fast-food spots, ranked by seed-oil free, fresh and sugar signals.">
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.inputBare}
          placeholder="What are you craving? e.g. grass-fed burger"
          placeholderTextColor={colors.textMuted}
          value={foodInput}
          onChangeText={setFoodInput}
          onSubmitEditing={() => runSearch()}
          returnKeyType="search"
          accessibilityLabel="Food search"
        />
        {foodInput ? (
          <Pressable onPress={clearFood} accessibilityLabel="Clear food search" hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.inputWrap, { flex: 1 }]}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.inputBare}
            placeholder={area && !('q' in area) ? 'Near you · or type city / zip' : 'City or zip code'}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => runSearch()}
            returnKeyType="search"
            accessibilityLabel="City or zip code"
          />
        </View>
        <Pressable
          style={[styles.iconButton, styles.iconButtonAlt]}
          onPress={() => {
            setQuery('');
            locateUser();
          }}
          accessibilityLabel="Use my location"
        >
          <Ionicons name="locate" size={20} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.searchButton} onPress={() => runSearch()} accessibilityLabel="Search">
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.suggestions}>
        {FOOD_SUGGESTIONS.map((s) => (
          <Pressable key={s} onPress={() => pickSuggestion(s)} style={[styles.suggestion, food === s && styles.suggestionOn]}>
            <Text style={styles.suggestionText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filters}>
        {CRITERIA.map(({ key, label }) => (
          <Chip key={key} label={label} on={filters.includes(key)} onPress={() => toggleFilter(key)} />
        ))}
        <Chip label="Verified only" icon="shield-checkmark" on={verifiedOnly} onPress={() => setVerifiedOnly((v) => !v)} />
        <Chip
          label={`More filters${moreActive ? ` (${moreActive})` : ''}`}
          icon={showMore ? 'chevron-up' : 'options-outline'}
          on={false}
          onPress={() => setShowMore((v) => !v)}
        />
      </View>

      {showMore ? (
        <View style={styles.more}>
          {ATTRIBUTE_GROUPS.map((g) => (
            <View key={g.key} style={{ gap: spacing.xs }}>
              <Text style={styles.moreTitle}>{g.label}</Text>
              <View style={styles.filters}>
                {ATTRIBUTES.filter((a) => a.group === g.key).map((a) => (
                  <Chip key={a.key} label={a.label} on={filters.includes(a.key)} onPress={() => toggleFilter(a.key)} />
                ))}
              </View>
            </View>
          ))}
          <Text style={styles.moreNote}>
            On cards, tags with a ✓ are explicit (e.g. a fully vegan restaurant); tags without one are likely (e.g. has vegan options). Each filter
            you turn on also searches for places that advertise it (up to 4 searches at a time).
          </Text>
        </View>
      ) : null}

      {filters.length || verifiedOnly ? (
        <Pressable
          onPress={() => {
            setFilters([]);
            setVerifiedOnly(false);
          }}
        >
          <Text style={styles.clear}>Clear all filters</Text>
        </Pressable>
      ) : null}

      <View style={styles.legend}>
        {(['verified', 'likely', 'unlikely', 'unknown'] as const).map((c) => (
          <View key={c} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CONFIDENCE_STYLE[c].text }]} />
            <Text style={styles.legendText}>{CONFIDENCE_STYLE[c].label}</Text>
          </View>
        ))}
        <Text style={styles.legendText}>· tap a card to see why</Text>
      </View>

      <Body
        state={state}
        visible={visible}
        filtered={filters.length > 0 || verifiedOnly}
        onRetry={locateUser}
        community={
          configured
            ? (r) => ({
                tallies: tallies.get(r.id),
                myVotes: myVotes.get(r.id),
                onReport: user ? (c, v) => report(r, c, v) : undefined,
                onSignIn: user ? undefined : () => router.push('/account'),
              })
            : undefined
        }
      />
    </Screen>
  );
}

function Chip(props: { label: string; on: boolean; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.chip, props.on && styles.chipOn]} accessibilityState={{ selected: props.on }}>
      {props.on || props.icon ? (
        <Ionicons name={props.on ? 'checkmark' : props.icon!} size={14} color={props.on ? '#FFFFFF' : colors.primary} />
      ) : null}
      <Text style={[styles.chipText, props.on && styles.chipTextOn]}>{props.label}</Text>
    </Pressable>
  );
}

function Body({
  state,
  visible,
  filtered,
  onRetry,
  community,
}: {
  state: State;
  visible: Restaurant[];
  filtered: boolean;
  onRetry: () => void;
  community?: (r: Restaurant) => CommunityProps;
}) {
  switch (state.status) {
    case 'locating':
      return <Status icon="locate-outline" text="Finding your location…" loading />;
    case 'loading':
      return <Status icon="restaurant-outline" text={`Searching restaurants and checking their websites · ${state.label}`} loading />;
    case 'denied':
      return <Status icon="location-outline" text="Location is off. Type a city or zip code above to search an area instead." />;
    case 'missing_key':
      return (
        <Status
          icon="key-outline"
          text="Restaurant search isn't connected yet. Add your Google Places API key to the .env.local file, then restart the server."
        />
      );
    case 'error':
      return <Status icon="alert-circle-outline" text={state.message} actionLabel="Try again" onAction={onRetry} />;
    case 'ready':
      if (state.restaurants.length === 0) return <Status icon="sad-outline" text="No non-fast-food restaurants found in this area." />;
      if (visible.length === 0) return <Status icon="filter-outline" text="No restaurants match all selected filters. Try turning one off." />;
      return (
        <>
          <View style={styles.countRow}>
            <Text style={styles.count}>
              {visible.length} {filtered ? 'matching restaurants' : 'restaurants'} · {state.label}
            </Text>
            {state.refreshing ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
          {visible.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} community={community?.(r)} />
          ))}
        </>
      );
  }
}

function Status(props: { icon: keyof typeof Ionicons.glyphMap; text: string; loading?: boolean; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.status}>
      {props.loading ? <ActivityIndicator color={colors.primary} /> : <Ionicons name={props.icon} size={32} color={colors.textMuted} />}
      <Text style={styles.statusText}>{props.text}</Text>
      {props.actionLabel ? (
        <Pressable onPress={props.onAction} style={styles.retry}>
          <Text style={styles.retryText}>{props.actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputBare: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text, minWidth: 0 },
  iconButton: { width: 44, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  iconButtonAlt: { backgroundColor: colors.primarySoft },
  searchButton: { paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -spacing.xs },
  suggestion: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#EEF1EF' },
  suggestionOn: { backgroundColor: colors.primarySoft },
  suggestionText: { fontSize: 13, color: colors.text },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextOn: { color: '#FFFFFF' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: -spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.textMuted },
  count: { fontSize: 13, color: colors.textMuted },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  more: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  moreTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  moreNote: { fontSize: 12, color: colors.textMuted },
  clear: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: -spacing.xs },
  status: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  statusText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  retry: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8, backgroundColor: colors.primarySoft },
  retryText: { color: colors.primary, fontWeight: '600' },
});
