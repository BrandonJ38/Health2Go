import { StyleSheet, Text, View } from 'react-native';
import type { EvidenceLevel } from '../../lib/learn/types';

export const EVIDENCE_STYLE: Record<EvidenceLevel, { label: string; description: string; fg: string; bg: string }> = {
  strong: { label: 'Strong evidence', description: 'Consistent findings from trials, large studies or official guidelines', fg: '#1F6B45', bg: '#DDF1E4' },
  emerging: { label: 'Emerging evidence', description: 'Early or limited research — small trials, animal or lab studies', fg: '#7A5200', bg: '#FFF1CC' },
  debated: { label: 'Debated', description: 'Credible studies disagree', fg: '#5B3FA8', bg: '#ECE6FA' },
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const s = EVIDENCE_STYLE[level];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});
