import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import type { Rating } from '../../lib/food/avoidCheck';
import { AVOID_CATEGORIES, labelFor, type AvoidKey } from '../../lib/profile/options';

export const RATING_STYLE: Record<Rating, { label: string; icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string }> = {
  good: { label: 'Good', icon: 'checkmark-circle', fg: colors.primary, bg: colors.primarySoft },
  okay: { label: 'Okay', icon: 'alert-circle', fg: '#9A6700', bg: '#FFF4D6' },
  avoid: { label: 'Avoid', icon: 'close-circle', fg: '#B42318', bg: '#FDE7E5' },
};

export function RatingBadge({ rating, large }: { rating: Rating; large?: boolean }) {
  const s = RATING_STYLE[rating];
  return (
    <View style={[styles.rating, { backgroundColor: s.bg }, large && styles.ratingLarge]}>
      <Ionicons name={s.icon} size={large ? 22 : 15} color={s.fg} />
      <Text style={[styles.ratingText, { color: s.fg }, large && styles.ratingTextLarge]}>{s.label}</Text>
    </View>
  );
}

// Short labels for small tags ("Seed oils", "Added sugar"…).
const SHORT: Record<AvoidKey, string> = {
  seedOils: 'Seed oils',
  addedSugar: 'Added sugar',
  ultraProcessed: 'Ultra-processed',
  artificialSweeteners: 'Sweeteners & additives',
  alcohol: 'Alcohol',
  transFats: 'Trans fats',
};

export const avoidLabel = (k: AvoidKey) => SHORT[k] ?? labelFor(AVOID_CATEGORIES, k) ?? k;

export function FlagTags({ flags }: { flags: AvoidKey[] }) {
  if (!flags.length) return null;
  return (
    <View style={styles.tags}>
      {flags.map((f) => (
        <View key={f} style={styles.tag}>
          <Text style={styles.tagText}>{avoidLabel(f)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  ratingLarge: { paddingHorizontal: 14, paddingVertical: 7 },
  ratingText: { fontSize: 12, fontWeight: '700' },
  ratingTextLarge: { fontSize: 17 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: '#FDE7E5', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 11, fontWeight: '600', color: '#B42318' },
});
