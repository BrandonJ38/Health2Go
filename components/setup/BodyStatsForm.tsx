import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { GENDERS } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';
import { ageFromBirthYear, cmToFtIn, ftInToCm, kgToLb, lbToKg, type Units } from '../../lib/profile/types';
import { ChoiceList } from './ChoiceList';
import { NumberField } from './NumberField';

// Plausible adult ranges — outside these the field is flagged and not saved.
const RANGES = {
  age: [13, 100],
  ft: [3, 8],
  inches: [0, 11],
  lb: [60, 700],
  cm: [90, 250],
  kg: [25, 320],
} as const;

const inRange = (text: string, [min, max]: readonly [number, number]) => {
  const n = Number(text);
  return text !== '' && Number.isFinite(n) && n >= min && n <= max;
};

export function UnitToggle({ units, onChange }: { units: Units; onChange: (u: Units) => void }) {
  return (
    <View style={styles.toggle}>
      {(['imperial', 'metric'] as const).map((u) => (
        <Pressable key={u} onPress={() => onChange(u)} style={[styles.toggleOption, units === u && styles.toggleOn]}>
          <Text style={[styles.toggleText, units === u && styles.toggleTextOn]}>{u === 'imperial' ? 'ft / lb' : 'cm / kg'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Text fields keep their own string state; the profile is only updated when a value is valid.
export function BodyStatsForm() {
  const { profile, update } = useProfile();
  const { units } = profile;
  const initial = profile.heightCm ? cmToFtIn(profile.heightCm) : null;

  const [ft, setFt] = useState(initial ? String(initial.ft) : '');
  const [inches, setInches] = useState(initial ? String(initial.inches) : '');
  const [cm, setCm] = useState(profile.heightCm ? String(Math.round(profile.heightCm)) : '');
  const [lb, setLb] = useState(profile.weightKg ? String(kgToLb(profile.weightKg)) : '');
  const [kg, setKg] = useState(profile.weightKg ? String(profile.weightKg) : '');
  const savedAge = ageFromBirthYear(profile.birthYear);
  const [age, setAge] = useState(savedAge != null ? String(savedAge) : '');

  useEffect(() => {
    if (inRange(age, RANGES.age)) update({ birthYear: new Date().getFullYear() - Number(age) });
  }, [age, update]);

  useEffect(() => {
    if (units === 'imperial' && inRange(ft, RANGES.ft) && inRange(inches || '0', RANGES.inches)) {
      update({ heightCm: ftInToCm(Number(ft), Number(inches || 0)) });
    } else if (units === 'metric' && inRange(cm, RANGES.cm)) {
      update({ heightCm: Number(cm) });
    }
  }, [units, ft, inches, cm, update]);

  useEffect(() => {
    if (units === 'imperial' && inRange(lb, RANGES.lb)) update({ weightKg: lbToKg(Number(lb)) });
    else if (units === 'metric' && inRange(kg, RANGES.kg)) update({ weightKg: Number(kg) });
  }, [units, lb, kg, update]);

  // Switching units converts what's already saved so the other fields aren't blank.
  const switchUnits = (u: Units) => {
    if (profile.heightCm) {
      const fi = cmToFtIn(profile.heightCm);
      setFt(String(fi.ft));
      setInches(String(fi.inches));
      setCm(String(Math.round(profile.heightCm)));
    }
    if (profile.weightKg) {
      setLb(String(kgToLb(profile.weightKg)));
      setKg(String(profile.weightKg));
    }
    update({ units: u });
  };

  const flag = (text: string, range: readonly [number, number]) => text !== '' && !inRange(text, range);

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text style={styles.sectionLabel}>Sex (used for the calorie estimate)</Text>
        <ChoiceList
          options={GENDERS}
          selected={profile.gender ? [profile.gender] : []}
          onChange={([g]) => update({ gender: g as (typeof GENDERS)[number]['value'] })}
          variant="chips"
        />
      </View>

      <View style={styles.row}>
        <NumberField label="Age" unit="years" value={age} onChange={setAge} invalid={flag(age, RANGES.age)} />
      </View>

      <UnitToggle units={units} onChange={switchUnits} />

      {units === 'imperial' ? (
        <View style={styles.row}>
          <NumberField label="Height" unit="ft" value={ft} onChange={setFt} invalid={flag(ft, RANGES.ft)} />
          <NumberField label=" " a11yLabel="Height, inches" unit="in" value={inches} onChange={setInches} invalid={flag(inches, RANGES.inches)} />
        </View>
      ) : (
        <View style={styles.row}>
          <NumberField label="Height" unit="cm" value={cm} onChange={setCm} invalid={flag(cm, RANGES.cm)} />
        </View>
      )}

      <View style={styles.row}>
        {units === 'imperial' ? (
          <NumberField label="Weight" unit="lb" value={lb} onChange={setLb} invalid={flag(lb, RANGES.lb)} />
        ) : (
          <NumberField label="Weight" unit="kg" value={kg} onChange={setKg} invalid={flag(kg, RANGES.kg)} decimal />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md },
  toggle: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#EEF1EF', borderRadius: 10, padding: 3 },
  toggleOption: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  toggleOn: { backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  toggleTextOn: { color: colors.text },
});
