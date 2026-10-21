import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { TIMELINES, type Timeline } from '../../lib/profile/options';
import { useProfile } from '../../lib/profile/ProfileContext';
import { kgToLb, lbToKg } from '../../lib/profile/types';
import { ChoiceList } from './ChoiceList';
import { NumberField } from './NumberField';

// Timeline, plus a target weight for weight-related goals. The safe-pace check happens
// in the Calorie Tracker (build step 2), where the daily target is calculated.
export function TimelineForm() {
  const { profile, update } = useProfile();
  const metric = profile.units === 'metric';
  const wantsWeightChange = profile.goal === 'fatLoss' || profile.goal === 'muscle';

  const [target, setTarget] = useState(
    profile.targetWeightKg ? String(metric ? profile.targetWeightKg : kgToLb(profile.targetWeightKg)) : '',
  );

  useEffect(() => {
    const n = Number(target);
    if (target === '') update({ targetWeightKg: null });
    else if (Number.isFinite(n) && n > 20 && n < 700) update({ targetWeightKg: metric ? n : lbToKg(n) });
  }, [target, metric, update]);

  return (
    <View style={{ gap: spacing.lg }}>
      <ChoiceList
        options={TIMELINES}
        selected={profile.timeline ? [profile.timeline] : []}
        onChange={([t]) => update({ timeline: t as Timeline })}
      />
      {wantsWeightChange ? (
        <View style={{ gap: spacing.xs }}>
          <View style={styles.row}>
            <NumberField label="Target weight (optional)" unit={metric ? 'kg' : 'lb'} value={target} onChange={setTarget} decimal={metric} />
          </View>
          <Text style={styles.hint}>We'll suggest a safe pace if the timeline is too aggressive.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  hint: { fontSize: 13, color: colors.textMuted },
});
