import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';

type Props = {
  label: string;
  unit: string;
  value: string;
  onChange: (text: string) => void;
  invalid?: boolean;
  decimal?: boolean;
  a11yLabel?: string; // when the visible label is blank (e.g. the inches box next to feet)
};

// Small numeric input with a unit suffix ("ft", "lb", "cm"…).
export function NumberField({ label, unit, value, onChange, invalid, decimal, a11yLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, invalid && styles.boxInvalid]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => onChange(t.replace(decimal ? /[^\d.]/g : /\D/g, ''))}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          inputMode={decimal ? 'decimal' : 'numeric'}
          maxLength={5}
          accessibilityLabel={a11yLabel ?? `${label} in ${unit}`}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  boxInvalid: { borderColor: '#D9534F' },
  input: { flex: 1, paddingVertical: 10, fontSize: 17, color: colors.text, minWidth: 0 },
  unit: { fontSize: 15, color: colors.textMuted, marginLeft: spacing.xs },
});
