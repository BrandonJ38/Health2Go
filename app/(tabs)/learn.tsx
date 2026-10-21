import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EVIDENCE_STYLE } from '../../components/learn/EvidenceBadge';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { ARTICLES } from '../../lib/learn/articles';
import { tipForDate } from '../../lib/learn/tips';
import type { Article, EvidenceLevel } from '../../lib/learn/types';
import { useProfile } from '../../lib/profile/ProfileContext';

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={{ pathname: '/learn/[slug]', params: { slug: article.slug } }} asChild>
      <Pressable style={styles.card} accessibilityRole="link">
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.cardTitle}>{article.title}</Text>
          <Text style={styles.cardSummary}>{article.summary}</Text>
          <Text style={styles.cardMeta}>
            {article.readMinutes} min read · {article.claims.length} sourced claims
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

export default function LearnScreen() {
  const { profile } = useProfile();
  const tip = tipForDate(profile);
  const onList = ARTICLES.filter((a) => a.avoid.some((k) => profile.avoid.includes(k)));
  const rest = ARTICLES.filter((a) => !onList.includes(a));

  return (
    <Screen title="Learn" subtitle="What foods and ingredients really do to your body — every claim linked to its source.">
      <Link href={{ pathname: '/learn/[slug]', params: { slug: tip.article } }} asChild>
        <Pressable style={styles.tip}>
          <Text style={styles.tipLabel}>Today's tip</Text>
          <Text style={styles.tipText}>{tip.text}</Text>
          <Text style={styles.tipLink}>Read why ›</Text>
        </Pressable>
      </Link>

      {onList.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On your avoid list</Text>
          {onList.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{onList.length ? 'More topics' : 'All topics'}</Text>
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>How to read the evidence labels</Text>
        {(Object.keys(EVIDENCE_STYLE) as EvidenceLevel[]).map((level) => (
          <View key={level} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: EVIDENCE_STYLE[level].fg }]} />
            <Text style={styles.legendText}>
              <Text style={{ fontWeight: '700' }}>{EVIDENCE_STYLE[level].label}:</Text> {EVIDENCE_STYLE[level].description}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tip: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, gap: spacing.sm },
  tipLabel: { color: colors.primarySoft, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  tipText: { color: '#FFFFFF', fontSize: 16, lineHeight: 23, fontWeight: '500' },
  tipLink: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardSummary: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  cardMeta: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  legend: { gap: spacing.sm, paddingTop: spacing.sm },
  legendTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  legendRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  legendText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },
});
