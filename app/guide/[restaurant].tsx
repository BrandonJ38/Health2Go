import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GuideBadge } from '../../components/guides/GuideBadge';
import { colors, spacing } from '../../constants/theme';
import { guideFor } from '../../lib/guides/guides';
import { RESTAURANTS } from '../../lib/profile/options';

function List({ title, items, mark, color }: { title: string; items: string[]; mark: string; color: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {items.map((i) => (
        <Text key={i} style={styles.item}>
          <Text style={{ color, fontWeight: '800' }}>{mark}</Text>  {i}
        </Text>
      ))}
    </View>
  );
}

export default function GuideScreen() {
  const { restaurant } = useLocalSearchParams<{ restaurant: string }>();
  const guide = guideFor(restaurant ?? '');
  const info = RESTAURANTS.find((r) => r.value === restaurant);

  if (!guide || !info) {
    return (
      <View style={styles.center}>
        <Text style={styles.item}>No guide for this restaurant yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: info.label }} />
      <View style={styles.header}>
        {info.image ? <Image source={{ uri: info.image }} style={styles.logo} /> : null}
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.title}>What to order at {info.label}</Text>
          <GuideBadge verdict={guide.verdict} />
        </View>
      </View>

      <View style={styles.oil}>
        <Text style={styles.oilLabel}>What they cook with</Text>
        <Text style={styles.oilText}>{guide.oil.text}</Text>
        <Text style={styles.source} onPress={() => Linking.openURL(guide.oil.url)}>
          {guide.oil.official ? 'Official' : 'Reported'} · {guide.oil.source} ↗
        </Text>
      </View>

      <List title="Best picks" items={guide.bestPicks} mark="✓" color={colors.primary} />
      <List title="Skip" items={guide.skip} mark="✕" color="#B42318" />
      <List title="How to order" items={guide.howToOrder} mark="→" color={colors.textMuted} />

      <Text style={styles.footer}>
        Last checked {guide.checked}. Recipes change and can vary by location — when in doubt, ask the staff what oil they cook with.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  oil: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  oilLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  oilText: { fontSize: 15, lineHeight: 22, color: colors.text },
  source: { fontSize: 13, fontWeight: '700', color: colors.primary },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  item: { fontSize: 15, lineHeight: 22, color: colors.text },
  footer: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
