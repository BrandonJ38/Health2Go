import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { ATTRIBUTES, CRITERIA, type Confidence, type CriterionKey, type Restaurant } from '../../lib/nearby/types';
import { openInApp } from '../../lib/openInApp';
import { isConfirmed, isDisputed, type MyVotes, type PlaceTallies } from '../../lib/cloud/reports';
import { guideKeyForName } from '../../lib/guides/guides';
import { CRITERION_ARTICLE } from '../../lib/learn/links';
import type { AvoidKey } from '../../lib/profile/options';

// When a place is rated "Unlikely" on a criterion, pre-tag the logged meal with the matching avoid category.
const CRITERION_TO_AVOID: Partial<Record<CriterionKey, AvoidKey>> = {
  seedOilFree: 'seedOils',
  noAddedSugar: 'addedSugar',
  freshIngredients: 'ultraProcessed',
};

// fg/bg = badge colors; text = color when the label appears on a white background.
export const CONFIDENCE_STYLE: Record<
  Confidence,
  { label: string; icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string; text: string }
> = {
  verified: { label: 'Verified', icon: 'checkmark-circle', fg: '#FFFFFF', bg: colors.primary, text: colors.primary },
  likely: { label: 'Likely', icon: 'checkmark', fg: colors.primary, bg: colors.primarySoft, text: colors.primary },
  unlikely: { label: 'Unlikely', icon: 'close', fg: '#B54708', bg: '#FEF0E6', text: '#B54708' },
  unknown: { label: 'Unknown', icon: 'help', fg: colors.textMuted, bg: '#EEF1EF', text: colors.textMuted },
};

// Friendly names for ordering platforms found on restaurant websites.
const ORDER_PLATFORMS: [string, string][] = [
  ['toasttab.com', 'Toast'],
  ['chownow.com', 'ChowNow'],
  ['square.site', 'Square'],
  ['squareup.com', 'Square'],
  ['clover.com', 'Clover'],
  ['order.online', 'DoorDash'],
  ['doordash.com', 'DoorDash'],
  ['ubereats.com', 'Uber Eats'],
  ['grubhub.com', 'Grubhub'],
  ['seamless.com', 'Seamless'],
];

function orderLabel(url: string): string {
  try {
    const host = new URL(url).hostname;
    const platform = ORDER_PLATFORMS.find(([h]) => host === h || host.endsWith('.' + h));
    return platform ? `Order online (${platform[1]})` : 'Order online';
  } catch {
    return 'Order online';
  }
}

// Delivery apps open a search for the restaurant in the user's own app/account (uses their saved address).
const deliveryApps = (name: string) => {
  const q = encodeURIComponent(name);
  return [
    { label: 'DoorDash', url: `https://www.doordash.com/search/store/${q}/` },
    { label: 'Uber Eats', url: `https://www.ubereats.com/search?q=${q}` },
    { label: 'Grubhub', url: `https://www.grubhub.com/search?queryText=${q}` },
  ];
};

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? 'Nearby' : `${miles.toFixed(1)} mi`;
}

const open = (url: string) => Linking.openURL(url);

function Price({ tier }: { tier: number }) {
  return (
    <Text style={styles.price} accessibilityLabel={`Price ${tier} of 3`}>
      {'$'.repeat(tier)}
      <Text style={styles.priceDim}>{'$'.repeat(3 - tier)}</Text>
    </Text>
  );
}

function ActionButton(props: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.action, props.primary && styles.actionPrimary]} accessibilityRole="button">
      <Ionicons name={props.icon} size={16} color={props.primary ? '#FFFFFF' : colors.primary} />
      <Text style={[styles.actionText, props.primary && styles.actionTextPrimary]}>{props.label}</Text>
    </Pressable>
  );
}

function OptionRow(props: { icon: keyof typeof Ionicons.glyphMap; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.option} accessibilityRole="link">
      <Ionicons name={props.icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.optionLabel}>{props.label}</Text>
        {props.hint ? <Text style={styles.optionHint}>{props.hint}</Text> : null}
      </View>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

// Community reports: shown when accounts are set up. `onReport` is undefined when signed out.
export type CommunityProps = {
  tallies?: PlaceTallies;
  myVotes?: MyVotes;
  onReport?: (criterion: CriterionKey, value: boolean) => void;
  onSignIn?: () => void;
};

function ReportRow({ criterion, community }: { criterion: CriterionKey; community: CommunityProps }) {
  const t = community.tallies?.[criterion];
  const mine = community.myVotes?.[criterion];
  const summary = t ? `Users: ${t.yes} yes · ${t.no} no` : 'No user reports yet';
  return (
    <View style={styles.reportRow}>
      <Text style={styles.reportSummary}>{summary}</Text>
      {community.onReport ? (
        <View style={styles.reportButtons}>
          {[true, false].map((v) => (
            <Pressable
              key={String(v)}
              onPress={() => community.onReport!(criterion, v)}
              style={[styles.reportButton, mine === v && (v ? styles.reportYes : styles.reportNo)]}
              accessibilityLabel={`Report ${v ? 'yes' : 'no'}`}
              accessibilityState={{ selected: mine === v }}
            >
              <Text style={[styles.reportButtonText, mine === v && styles.reportButtonTextOn]}>{v ? 'Yes' : 'No'}</Text>
            </Pressable>
          ))}
        </View>
      ) : community.onSignIn ? (
        <Text style={styles.sourceLink} onPress={community.onSignIn}>
          Sign in to report
        </Text>
      ) : null}
    </View>
  );
}

// Chain logo or site icon; a letter badge when there isn't one (or it fails to load).
function Logo({ uri, name }: { uri: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.logo, styles.logoFallback]}>
        <Text style={styles.logoLetter}>{name.replace(/^thes+/i, '').charAt(0).toUpperCase()}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.logo} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;
}

export function RestaurantCard({ restaurant, community }: { restaurant: Restaurant; community?: CommunityProps }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const r = restaurant;
  const meta = [r.cuisine, r.distanceMeters != null ? formatDistance(r.distanceMeters) : null, r.rating ? `★ ${r.rating.toFixed(1)}` : null]
    .filter(Boolean)
    .join('  ·  ');
  const services = [r.delivery ? 'Delivery' : null, r.takeout ? 'Takeout' : null].filter(Boolean).join(' · ');
  // Show delivery apps unless Google says the place doesn't deliver.
  const showDeliveryApps = r.delivery !== false;
  const canOrder = !!r.orderUrl || !!r.phoneUri || showDeliveryApps;
  const guideKey = guideKeyForName(r.name);
  // An online-ordering page shows the menu too, so it's a good fallback.
  const menuLink = r.menuUrl ?? r.orderUrl;
  const [justOrdered, setJustOrdered] = useState(false);

  const logMeal = () => {
    const flags = (Object.keys(CRITERION_TO_AVOID) as CriterionKey[])
      .filter((k) => r.criteria[k].confidence === 'unlikely')
      .map((k) => CRITERION_TO_AVOID[k]!);
    router.push({ pathname: '/food/add', params: { mode: 'manual', source: 'restaurant', name: r.name, flags: flags.join(',') } });
  };

  // After an ordering page or app is closed, offer to log the meal.
  const startOrder = async (go: () => Promise<unknown>) => {
    await go();
    setOrdering(false);
    setJustOrdered(true);
  };
  const attributeTags = ATTRIBUTES.flatMap((a) => (r.attributes?.[a.key] ? [{ ...a, level: r.attributes[a.key]!.level }] : []));

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setExpanded((e) => !e)} style={styles.summary} accessibilityRole="button" accessibilityHint="Shows why it got each badge">
        <View style={styles.headerRow}>
          <Logo uri={r.logoUrl} name={r.name} />
          <Text style={styles.name} numberOfLines={2}>
            {r.name}
          </Text>
          {r.price ? <Price tier={r.price} /> : null}
        </View>
        <Text style={styles.meta}>{meta}</Text>
        {/* Street address helps tell apart several branches of the same chain. */}
        {r.address ? (
          <Text style={styles.street} numberOfLines={1}>
            {r.address.split(',')[0]}
          </Text>
        ) : null}
        {services ? <Text style={styles.services}>{services}</Text> : null}

        {community && CRITERIA.some(({ key }) => isConfirmed(community.tallies?.[key])) ? (
          <View style={styles.community}>
            <Ionicons name="people" size={14} color="#FFFFFF" />
            <Text style={styles.communityText}>
              Users confirm: {CRITERIA.filter(({ key }) => isConfirmed(community.tallies?.[key])).map((c) => c.label).join(', ')}
            </Text>
          </View>
        ) : null}
        {community && CRITERIA.some(({ key }) => isDisputed(community.tallies?.[key])) ? (
          <Text style={styles.disputed}>
            Users report it's not: {CRITERIA.filter(({ key }) => isDisputed(community.tallies?.[key])).map((c) => c.label.toLowerCase()).join(', ')}
          </Text>
        ) : null}

        <View style={styles.badges}>
          {CRITERIA.map(({ key, label }) => {
            const s = CONFIDENCE_STYLE[r.criteria[key].confidence];
            return (
              <View key={key} style={[styles.badge, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={13} color={s.fg} />
                <Text style={[styles.badgeText, { color: s.fg }]}>{label}</Text>
              </View>
            );
          })}
        </View>
        {attributeTags.length ? (
          <View style={styles.attrs}>
            {attributeTags.map((a) => (
              <View key={a.key} style={[styles.attr, a.level === 'yes' && styles.attrYes]}>
                {a.level === 'yes' ? <Ionicons name="checkmark" size={12} color={colors.primary} /> : null}
                <Text style={styles.attrText}>{a.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        {canOrder ? <ActionButton icon="bag-handle-outline" label="Order" primary onPress={() => setOrdering((o) => !o)} /> : null}
        {menuLink ? <ActionButton icon="book-outline" label="Menu" onPress={() => openInApp(menuLink)} /> : null}
        {guideKey ? (
          <ActionButton
            icon="list-outline"
            label="What to order"
            onPress={() => router.push({ pathname: '/guide/[restaurant]', params: { restaurant: guideKey } })}
          />
        ) : null}
        {r.mapsUrl ? <ActionButton icon="navigate-outline" label="Directions" onPress={() => open(r.mapsUrl!)} /> : null}
        {r.website ? <ActionButton icon="globe-outline" label="Website" onPress={() => openInApp(r.website!)} /> : null}
        {r.phoneUri ? <ActionButton icon="call-outline" label="Call" onPress={() => open(r.phoneUri!)} /> : null}
        <ActionButton icon="add-circle-outline" label="Log meal" onPress={logMeal} />
      </View>

      {ordering ? (
        <View style={styles.orderPanel}>
          <Text style={styles.panelTitle}>Order from {r.name}</Text>
          {r.orderUrl ? (
            <OptionRow
              icon="storefront-outline"
              label={orderLabel(r.orderUrl)}
              hint="Opens the restaurant's own ordering page here in the app"
              onPress={() => startOrder(() => openInApp(r.orderUrl!))}
            />
          ) : null}
          {r.phoneUri ? (
            <OptionRow icon="call-outline" label="Call to order" hint={r.phone ?? undefined} onPress={() => startOrder(() => open(r.phoneUri!))} />
          ) : null}
          {showDeliveryApps
            ? deliveryApps(r.name).map((app) => (
                <OptionRow key={app.label} icon="bicycle-outline" label={`Find on ${app.label}`} onPress={() => startOrder(() => open(app.url))} />
              ))
            : null}
          {showDeliveryApps ? (
            <Text style={styles.panelNote}>Delivery apps open in their own app or site — the restaurant may not be listed on every app.</Text>
          ) : null}
        </View>
      ) : null}

      {justOrdered ? (
        <View style={styles.loggedPrompt}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.loggedText}>Ordered something?</Text>
          <Pressable
            onPress={() => {
              setJustOrdered(false);
              logMeal();
            }}
            style={styles.loggedButton}
            accessibilityRole="button"
          >
            <Text style={styles.loggedButtonText}>Log this meal</Text>
          </Pressable>
          <Pressable onPress={() => setJustOrdered(false)} hitSlop={8} accessibilityLabel="Dismiss">
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      {expanded ? (
        <View style={styles.details}>
          {CRITERIA.map(({ key, label }) => {
            const c = r.criteria[key];
            return (
              <View key={key} style={styles.detailBlock}>
                <Text style={styles.detailTitle}>
                  {label}:{' '}
                  <Text style={{ color: CONFIDENCE_STYLE[c.confidence].text }}>{CONFIDENCE_STYLE[c.confidence].label}</Text>
                </Text>
                {c.evidence.length === 0 ? (
                  <Text style={styles.evidence}>No mentions found in reviews, descriptions or its website.</Text>
                ) : (
                  c.evidence.map((ev, i) => (
                    <Text key={i} style={styles.evidence}>
                      {ev.supports ? '＋' : '－'} {ev.source}: “{ev.snippet}”
                      {ev.url ? (
                        <Text style={styles.sourceLink} onPress={() => open(ev.url!)}>
                          {'  '}Source ↗
                        </Text>
                      ) : null}
                    </Text>
                  ))
                )}
                {community ? <ReportRow criterion={key} community={community} /> : null}
              </View>
            );
          })}
          {attributeTags.length ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailTitle}>Also found</Text>
              {attributeTags.map((a) =>
                r.attributes[a.key]!.evidence.map((ev, i) => (
                  <Text key={`${a.key}-${i}`} style={styles.evidence}>
                    ＋ {a.label}{a.level === 'yes' ? '' : ' (likely)'} — {ev.source}: “{ev.snippet}”
                    {ev.url ? (
                      <Text style={styles.sourceLink} onPress={() => open(ev.url!)}>
                        {'  '}Source ↗
                      </Text>
                    ) : null}
                  </Text>
                )),
              )}
            </View>
          ) : null}
          {r.address ? <Text style={styles.address}>{r.address}</Text> : null}
          <View style={styles.learnLinks}>
            {[...new Set(CRITERIA.map(({ key }) => CRITERION_ARTICLE[key]))].map((slug) => (
              <Text key={slug} style={styles.sourceLink} onPress={() => router.push({ pathname: '/learn/[slug]', params: { slug } })}>
                Why {slug === 'seed-oils' ? 'seed oils' : slug === 'added-sugar' ? 'added sugar' : 'ultra-processed food'} matters ›
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable onPress={() => setExpanded((e) => !e)} style={styles.expandToggle} accessibilityRole="button">
        <Text style={styles.expandText}>{expanded ? 'Hide details' : 'Why these badges?'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  summary: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  logoLetter: { fontSize: 18, fontWeight: '800', color: colors.primary },
  attrs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  attr: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 7, paddingVertical: 2 },
  attrYes: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  attrText: { fontSize: 11, fontWeight: '600', color: colors.text },
  name: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  priceDim: { color: colors.border },
  meta: { fontSize: 14, color: colors.textMuted },
  street: { fontSize: 13, color: colors.textMuted, marginTop: -4 },
  services: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: -4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  actionPrimary: { backgroundColor: colors.primary },
  actionText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  actionTextPrimary: { color: '#FFFFFF' },
  loggedPrompt: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: 10, padding: spacing.sm },
  loggedText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  loggedButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  loggedButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  orderPanel: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.sm, gap: 2 },
  panelTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: 8 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionHint: { fontSize: 12, color: colors.textMuted },
  panelNote: { fontSize: 12, color: colors.textMuted, paddingHorizontal: spacing.sm, paddingTop: spacing.xs },
  details: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: spacing.sm },
  detailBlock: { gap: 2 },
  detailTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  evidence: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  sourceLink: { color: colors.primary, fontWeight: '600' },
  address: { fontSize: 13, color: colors.textMuted },
  community: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#2B6CB0', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  communityText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  disputed: { fontSize: 12, fontWeight: '600', color: '#B42318' },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: 4 },
  reportSummary: { fontSize: 12, color: colors.textMuted },
  reportButtons: { flexDirection: 'row', gap: 6 },
  reportButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border },
  reportYes: { backgroundColor: colors.primary, borderColor: colors.primary },
  reportNo: { backgroundColor: '#B42318', borderColor: '#B42318' },
  reportButtonText: { fontSize: 12, fontWeight: '700', color: colors.text },
  reportButtonTextOn: { color: '#FFFFFF' },
  learnLinks: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 4 },
  expandToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  expandText: { fontSize: 13, color: colors.textMuted },
});
