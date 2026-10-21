import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

// Shared scrollable wrapper so every screen has the same heading and padding.
export function Screen({ title, subtitle, children }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: -spacing.sm },
});
