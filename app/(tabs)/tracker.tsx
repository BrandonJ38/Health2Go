import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlagTags, avoidLabel } from '../../components/food/FoodBadges';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { sumNutrients, useFoodLog } from '../../lib/food/FoodLogContext';
import { computeTargets } from '../../lib/food/targets';
import { MEALS, localDate, mealForNow, shiftDate, type LogEntry, type Meal } from '../../lib/food/types';
import type { AvoidKey } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';

function dayLabel(date: string): string {
  const today = localDate();
  if (date === today) return 'Today';
  if (date === shiftDate(today, -1)) return 'Yesterday';
  if (date === shiftDate(today, 1)) return 'Tomorrow';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number | null; color: string }) {
  const pct = target ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.macro}>
      <View style={styles.macroHead}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {Math.round(value)}
          {target ? ` / ${target}` : ''} g
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function TrackerScreen() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const { forDate, remove } = useFoodLog();
  const [date, setDate] = useState(localDate());
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const result = computeTargets(profile, profile.calorieTargetOverride);
  const targets = result.ok ? result.targets : null;
  const entries = forDate(date);
  const totals = sumNutrients(entries);
  const remaining = targets ? targets.calories - Math.round(totals.kcal) : null;

  // Avoid-list check: how many of today's foods contain each avoided category.
  const avoidCounts = useMemo(() => {
    const counts = new Map<AvoidKey, number>();
    for (const e of entries) for (const f of e.flags) if (profile.avoid.includes(f)) counts.set(f, (counts.get(f) ?? 0) + 1);
    return [...counts.entries()];
  }, [entries, profile.avoid]);

  const openAdd = (params: Record<string, string>) => router.push({ pathname: '/food/add', params: { date, ...params } });
  const saveTarget = () => {
    const n = Number(targetInput);
    update({ calorieTargetOverride: Number.isFinite(n) && n >= 800 && n <= 6000 ? Math.round(n) : null });
    setEditingTarget(false);
  };

  return (
    <Screen title="Calories" subtitle="Track what you eat and what's on your avoid list.">
      <View style={styles.dateRow}>
        <Pressable onPress={() => setDate(shiftDate(date, -1))} hitSlop={10} accessibilityLabel="Previous day">
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.dateText}>{dayLabel(date)}</Text>
        <Pressable onPress={() => setDate(shiftDate(date, 1))} hitSlop={10} accessibilityLabel="Next day">
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.summary}>
        {targets ? (
          <>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.summaryBig}>{Math.round(totals.kcal)}</Text>
                <Text style={styles.summarySmall}>of {targets.calories} kcal</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryBig}>{Math.abs(remaining!)}</Text>
                <Text style={styles.summarySmall}>{remaining! >= 0 ? 'left' : 'over'}</Text>
              </View>
            </View>
            <View style={styles.trackLight}>
              <View style={[styles.fillLight, { width: `${Math.min(totals.kcal / targets.calories, 1) * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.summaryBig}>{Math.round(totals.kcal)} kcal</Text>
            <Text style={styles.summarySmall}>Add your {result.ok ? '' : result.missing.join(', ')} to get a daily target.</Text>
            <Pressable style={styles.summaryButton} onPress={() => router.push({ pathname: '/setup', params: { mode: 'edit', step: 'body' } })}>
              <Text style={styles.summaryButtonText}>Add body stats</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.macros}>
        <MacroBar label="Protein" value={totals.protein} target={targets?.protein ?? null} color="#2F855A" />
        <MacroBar label="Carbs" value={totals.carbs} target={targets?.carbs ?? null} color="#D69E2E" />
        <MacroBar label="Fat" value={totals.fat} target={targets?.fat ?? null} color="#3182CE" />
      </View>

      {targets ? (
        <View style={{ gap: 6 }}>
          {targets.warning ? (
            <View style={styles.warning}>
              <Ionicons name="warning-outline" size={18} color="#9A6700" />
              <Text style={styles.warningText}>{targets.warning}</Text>
            </View>
          ) : null}
          {targets.notes.map((n) => (
            <Text key={n} style={styles.note}>
              {n}
            </Text>
          ))}
          {editingTarget ? (
            <View style={styles.targetEdit}>
              <TextInput
                style={styles.targetInput}
                value={targetInput}
                onChangeText={(t) => setTargetInput(t.replace(/\D/g, ''))}
                inputMode="numeric"
                keyboardType="number-pad"
                placeholder={String(targets.calories)}
                accessibilityLabel="Daily calorie target"
                autoFocus
              />
              <Text style={styles.note}>kcal</Text>
              <Pressable onPress={saveTarget} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Save</Text>
              </Pressable>
              {profile.calorieTargetOverride ? (
                <Pressable
                  onPress={() => {
                    update({ calorieTargetOverride: null });
                    setEditingTarget(false);
                  }}
                >
                  <Text style={styles.link}>Use suggested</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setTargetInput(profile.calorieTargetOverride ? String(profile.calorieTargetOverride) : '');
                setEditingTarget(true);
              }}
            >
              <Text style={styles.link}>Change target</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <View style={[styles.avoidCard, avoidCounts.length ? styles.avoidCardFlagged : null]}>
        <Ionicons
          name={avoidCounts.length ? 'alert-circle-outline' : 'shield-checkmark-outline'}
          size={22}
          color={avoidCounts.length ? '#B42318' : colors.primary}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.avoidTitle}>Avoid-list check</Text>
          <Text style={styles.avoidText}>
            {entries.length === 0
              ? 'Log food to see what you avoided.'
              : avoidCounts.length
                ? avoidCounts.map(([k, n]) => `${avoidLabel(k)}: ${n} ${n === 1 ? 'food' : 'foods'}`).join(' · ')
                : 'Nothing from your avoid list. Nice.'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Action icon="barcode-outline" label="Scan" onPress={() => router.push({ pathname: '/food/scan', params: { date, meal: mealForNow() } })} />
        <Action icon="search-outline" label="Search" onPress={() => openAdd({ mode: 'search', meal: mealForNow() })} />
        <Action icon="create-outline" label="Quick add" onPress={() => openAdd({ mode: 'manual', meal: mealForNow() })} />
      </View>

      {MEALS.map((m) => (
        <MealSection
          key={m.value}
          meal={m.value}
          label={m.label}
          entries={entries.filter((e) => e.meal === m.value)}
          avoid={profile.avoid}
          onAdd={() => openAdd({ mode: 'search', meal: m.value })}
          onRemove={remove}
        />
      ))}
    </Screen>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function MealSection(props: {
  meal: Meal;
  label: string;
  entries: LogEntry[];
  avoid: AvoidKey[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const kcal = Math.round(sumNutrients(props.entries).kcal);
  return (
    <View style={styles.meal}>
      <View style={styles.mealHead}>
        <Text style={styles.mealTitle}>{props.label}</Text>
        <Text style={styles.mealKcal}>{kcal ? `${kcal} kcal` : ''}</Text>
        <Pressable onPress={props.onAdd} hitSlop={8} accessibilityLabel={`Add to ${props.label}`}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </Pressable>
      </View>
      {props.entries.map((e) => (
        <View key={e.id} style={styles.entry}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.entryName} numberOfLines={1}>
              {e.name}
            </Text>
            <Text style={styles.entryMeta}>
              {[e.brand, e.amountLabel, `P ${Math.round(e.nutrients.protein)} · C ${Math.round(e.nutrients.carbs)} · F ${Math.round(e.nutrients.fat)}`]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
            <FlagTags flags={e.flags.filter((f) => props.avoid.includes(f))} />
          </View>
          <Text style={styles.entryKcal}>{Math.round(e.nutrients.kcal)}</Text>
          <Pressable
            onPress={() => (confirmId === e.id ? props.onRemove(e.id) : setConfirmId(e.id))}
            hitSlop={8}
            accessibilityLabel={confirmId === e.id ? `Confirm remove ${e.name}` : `Remove ${e.name}`}
          >
            {confirmId === e.id ? (
              <Text style={styles.removeConfirm}>Remove?</Text>
            ) : (
              <Ionicons name="close" size={18} color={colors.textMuted} />
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  dateText: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 120, textAlign: 'center' },
  summary: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, gap: spacing.sm },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryBig: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  summarySmall: { color: colors.primarySoft, fontSize: 13, fontWeight: '600' },
  summaryButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginTop: 4 },
  summaryButtonText: { color: colors.primary, fontWeight: '700' },
  trackLight: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fillLight: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  macros: { flexDirection: 'row', gap: spacing.md },
  macro: { flex: 1, gap: 4 },
  macroHead: { gap: 1 },
  macroLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  macroValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  warning: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#FFF4D6', borderRadius: 10, padding: spacing.sm },
  warningText: { flex: 1, fontSize: 13, color: '#6B4A00', lineHeight: 18 },
  note: { fontSize: 13, color: colors.textMuted },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
  targetEdit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  targetInput: {
    width: 90,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  smallButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  smallButtonText: { color: '#FFFFFF', fontWeight: '700' },
  avoidCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 12, padding: spacing.md },
  avoidCardFlagged: { backgroundColor: '#FDE7E5' },
  avoidTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  avoidText: { fontSize: 13, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: colors.text },
  meal: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  mealHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mealTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  mealKcal: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  entryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  entryMeta: { fontSize: 12, color: colors.textMuted },
  entryKcal: { fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 40, textAlign: 'right' },
  removeConfirm: { fontSize: 12, fontWeight: '700', color: '#B42318' },
});
