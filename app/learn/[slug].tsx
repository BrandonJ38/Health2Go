import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EvidenceBadge } from '../../components/learn/EvidenceBadge';
import { colors, spacing } from '../../constants/theme';
import { articleBySlug } from '../../lib/learn/articles';
import { SOURCES } from '../../lib/learn/sources';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = articleBySlug(slug ?? '');

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Article not found.</Text>
      </View>
    );
  }

  // Number sources in order of first use, so claims can show [1], [2]…
  const order: string[] = [];
  for (const c of article.claims) for (const s of c.sources) if (!order.includes(s)) order.push(s);
  const ref = (key: string) => order.indexOf(key) + 1;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: article.title }} />
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.meta}>{article.readMinutes} min read</Text>

      <View style={styles.short}>
        <Text style={styles.shortLabel}>The short version</Text>
        <Text style={styles.shortText}>{article.shortVersion}</Text>
      </View>

      <Text style={styles.heading}>How it affects the body</Text>
      {article.claims.map((c, i) => (
        <View key={i} style={styles.claim}>
          <EvidenceBadge level={c.evidence} />
          <Text style={styles.body}>
            {c.text}{' '}
            {c.sources.map((s) => (
              <Text key={s} style={styles.ref} onPress={() => Linking.openURL(SOURCES[s].url)}>
                [{ref(s)}]
              </Text>
            ))}
          </Text>
        </View>
      ))}

      <Text style={styles.heading}>Where it hides</Text>
      {article.whereItHides.map((w) => (
        <Text key={w} style={styles.bullet}>
          •  {w}
        </Text>
      ))}
      {article.labelNames?.length ? (
        <View style={styles.labels}>
          <Text style={styles.labelsTitle}>Look for these on ingredient lists</Text>
          {article.labelNames.map((l) => (
            <Text key={l} style={styles.bullet}>
              •  {l}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.heading}>Better swaps</Text>
      {article.swaps.map((s) => (
        <Text key={s} style={styles.bullet}>
          ✓  {s}
        </Text>
      ))}

      <Text style={styles.heading}>Sources</Text>
      {order.map((key) => {
        const s = SOURCES[key];
        return (
          <Text key={key} style={styles.source} onPress={() => Linking.openURL(s.url)}>
            <Text style={styles.ref}>[{ref(key)}]</Text> {s.title}. <Text style={styles.sourcePub}>{s.publisher}, {s.year}.</Text>{' '}
            <Text style={styles.ref}>Open ↗</Text>
          </Text>
        );
      })}

      <Text style={styles.disclaimer}>
        {article.reviewed ? 'Reviewed by a health professional. ' : 'Drafted from the sources above; not yet reviewed by a registered dietitian or doctor. '}
        General information, not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: -spacing.sm },
  short: { backgroundColor: colors.primarySoft, borderRadius: 14, padding: spacing.md, gap: spacing.xs },
  shortLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  shortText: { fontSize: 16, lineHeight: 24, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  claim: { gap: 6, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  ref: { color: colors.primary, fontWeight: '700' },
  bullet: { fontSize: 15, lineHeight: 23, color: colors.text },
  labels: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 2 },
  labelsTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.xs },
  source: { fontSize: 13, lineHeight: 20, color: colors.text },
  sourcePub: { color: colors.textMuted, fontStyle: 'italic' },
  disclaimer: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: spacing.md },
});
