import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_PEEK_HEIGHT, DraggableSheet } from '@/components/draggable-sheet';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

export const PEEK_HEIGHT = DEFAULT_PEEK_HEIGHT;

type Transport = { name: string; distance: string; color: string };
type Facture = { name: string; status: string; statusColor: string; color: string };

const TRANSPORTS_TODAY: Transport[] = [{ name: 'Vélo', distance: '15km', color: Palette.itemGrey }];

const TRANSPORTS_YESTERDAY: Transport[] = [
  { name: 'Train', distance: '345km', color: Palette.itemGreen },
  { name: 'Bus', distance: '345km', color: Palette.itemPink },
];

const FACTURES_WEEK: Facture[] = [
  {
    name: 'Installation de\npanneau solaires',
    status: 'Vérifié',
    statusColor: Palette.statusVerified,
    color: Palette.itemBeige,
  },
  {
    name: 'Travaux isolation\nmaison',
    status: 'En cours',
    statusColor: Palette.statusPending,
    color: Palette.itemBlueGrey,
  },
];

export function HistorySheet() {
  return (
    <DraggableSheet
      header={
        <View style={styles.titleRow}>
          <Text style={styles.title}>Historique</Text>
          <Ionicons name="funnel-outline" size={24} color={Palette.timelineLine} />
        </View>
      }>
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />

        <Section label="Aujourd’hui">
          {TRANSPORTS_TODAY.map((t) => (
            <TransportCard key={t.name} item={t} />
          ))}
        </Section>

        <Section label="Hier">
          {TRANSPORTS_YESTERDAY.map((t) => (
            <TransportCard key={t.name} item={t} />
          ))}
        </Section>

        <Section label="Il y a 1 semaine">
          {FACTURES_WEEK.map((f) => (
            <FactureCard key={f.name} item={f} />
          ))}
        </Section>
      </View>
    </DraggableSheet>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>{label}</Text>
      </View>
      <View style={styles.cards}>{children}</View>
    </View>
  );
}

function TransportCard({ item }: { item: Transport }) {
  return (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardMeta}>{item.distance}</Text>
    </View>
  );
}

function FactureCard({ item }: { item: Facture }) {
  return (
    <View style={styles.factureBlock}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <View style={[styles.card, styles.factureCard, { backgroundColor: item.color }]}>
        <Text style={[styles.cardName, styles.factureName]}>{item.name}</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.factureLink}>Voir la{'\n'}facture</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: AppFonts.display,
    fontSize: 28,
    color: Palette.textDark,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 6,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 6,
    bottom: 40,
    width: 2,
    backgroundColor: Palette.timelineLine,
    opacity: 0.5,
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.timelineLine,
  },
  sectionLabel: {
    fontFamily: AppFonts.medium,
    fontSize: 14,
    color: Palette.sectionLabel,
  },
  cards: {
    marginLeft: 22,
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  card: {
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: AppFonts.medium,
    fontSize: 16,
    color: Palette.textDark,
  },
  cardMeta: {
    fontFamily: AppFonts.regular,
    fontSize: 14,
    color: Palette.textDark,
  },
  factureBlock: {
    marginTop: Spacing.three,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.one,
    marginBottom: Spacing.one,
    marginRight: Spacing.two,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: AppFonts.medium,
    fontSize: 12,
    color: Palette.textMuted,
  },
  factureCard: {
    minHeight: 84,
    paddingVertical: Spacing.three,
  },
  factureName: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  factureLink: {
    fontFamily: AppFonts.medium,
    fontSize: 14,
    color: Palette.textDark,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
});
