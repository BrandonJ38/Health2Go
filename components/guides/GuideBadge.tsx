import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { VERDICT_LABEL, type GuideVerdict } from '../../lib/guides/guides';

const STYLE: Record<GuideVerdict, { fg: string; bg: string }> = {
  good: { fg: colors.primary, bg: colors.primarySoft },
  mixed: { fg: '#7A5200', bg: '#FFF1CC' },
  tough: { fg: '#B42318', bg: '#FDE7E5' },
};

export function GuideBadge({ verdict }: { verdict: GuideVerdict }) {
  return (
    <View style={[styles.badge, { backgroundColor: STYLE[verdict].bg }]}>
      <Text style={[styles.text, { color: STYLE[verdict].fg }]}>{VERDICT_LABEL[verdict]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 11, fontWeight: '700' },
});
