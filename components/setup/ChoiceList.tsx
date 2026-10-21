import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { Option } from '../../lib/profile/options';

type Props = {
  options: readonly Option[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  // 'cards' = full-width rows (good with descriptions); 'chips' = compact wrap (long lists);
  // 'list' = scrolling rows with an image (e.g. restaurant logos) and a filter box.
  variant?: 'cards' | 'chips' | 'list';
};

// Logo with a letter badge fallback if the image fails to load.
function OptionImage({ uri, label }: { uri?: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.logo, styles.logoFallback]}>
        <Text style={styles.logoLetter}>{label.charAt(0)}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.logo} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;
}

export function ChoiceList({ options, selected, onChange, multi = false, variant = 'cards' }: Props) {
  const [filter, setFilter] = useState('');
  const toggle = (value: string) => {
    if (!multi) return onChange([value]);
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  if (variant === 'list') {
    const q = filter.trim().toLowerCase();
    const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    return (
      <View style={{ gap: spacing.sm }}>
        <View style={styles.filterBox}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.filterInput}
            value={filter}
            onChangeText={setFilter}
            placeholder="Search restaurants"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Search restaurants"
          />
        </View>
        {multi && selected.length ? <Text style={styles.count}>{selected.length} selected</Text> : null}
        <View style={styles.list}>
          {shown.map((o, i) => {
            const on = selected.includes(o.value);
            return (
              <Pressable
                key={o.value}
                onPress={() => toggle(o.value)}
                style={[styles.listRow, i > 0 && styles.listRowBorder, on && styles.listRowOn]}
                accessibilityRole={multi ? 'checkbox' : 'radio'}
                accessibilityState={{ checked: on }}
              >
                <OptionImage uri={o.image} label={o.label} />
                <Text style={styles.listLabel}>{o.label}</Text>
                <Ionicons
                  name={on ? (multi ? 'checkbox' : 'radio-button-on') : multi ? 'square-outline' : 'radio-button-off'}
                  size={22}
                  color={on ? colors.primary : colors.border}
                />
              </Pressable>
            );
          })}
          {shown.length === 0 ? <Text style={styles.empty}>No matches</Text> : null}
        </View>
      </View>
    );
  }

  if (variant === 'chips') {
    return (
      <View style={styles.chips}>
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <Pressable
              key={o.value}
              onPress={() => toggle(o.value)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole={multi ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: on }}
            >
              {on ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.cards}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <Pressable
            key={o.value}
            onPress={() => toggle(o.value)}
            style={[styles.card, on && styles.cardOn]}
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: on }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.cardLabel}>{o.label}</Text>
              {o.description ? <Text style={styles.cardDescription}>{o.description}</Text> : null}
            </View>
            <Ionicons
              name={on ? (multi ? 'checkbox' : 'radio-button-on') : multi ? 'square-outline' : 'radio-button-off'}
              size={22}
              color={on ? colors.primary : colors.border}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cardLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDescription: { fontSize: 13, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextOn: { color: '#FFFFFF' },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  filterInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text, minWidth: 0 },
  count: { fontSize: 13, fontWeight: '600', color: colors.primary },
  list: { borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 10 },
  listRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  listRowOn: { backgroundColor: colors.primarySoft },
  listLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.text },
  logo: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF' },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  logoLetter: { fontSize: 16, fontWeight: '700', color: colors.primary },
  empty: { padding: spacing.md, textAlign: 'center', color: colors.textMuted },
});
