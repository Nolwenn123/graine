import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts, Palette, Spacing } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
export const PEEK_HEIGHT = 150;
const SPRING = { damping: 18, stiffness: 150 };

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
  const insets = useSafeAreaInsets();

  const expandedTop = insets.top + 56;
  const sheetHeight = SCREEN_HEIGHT - expandedTop;
  const collapsedOffset = sheetHeight - PEEK_HEIGHT;

  const translateY = useSharedValue(collapsedOffset);
  const startY = useSharedValue(collapsedOffset);

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.min(Math.max(startY.value + e.translationY, 0), collapsedOffset);
    })
    .onEnd((e) => {
      const expand =
        e.velocityY < -300 || (e.velocityY <= 300 && translateY.value < collapsedOffset / 2);
      translateY.value = withSpring(expand ? 0 : collapsedOffset, SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.sheet, { top: expandedTop, height: sheetHeight }, sheetStyle]}>
      <GestureDetector gesture={pan}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Animated.Text style={styles.title}>Historique</Animated.Text>
            <Ionicons name="funnel-outline" size={24} color={Palette.timelineLine} />
          </View>
        </View>
      </GestureDetector>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>
    </Animated.View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionDot} />
        <Animated.Text style={styles.sectionLabel}>{label}</Animated.Text>
      </View>
      <View style={styles.cards}>{children}</View>
    </View>
  );
}

function TransportCard({ item }: { item: Transport }) {
  return (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <Animated.Text style={styles.cardName}>{item.name}</Animated.Text>
      <Animated.Text style={styles.cardMeta}>{item.distance}</Animated.Text>
    </View>
  );
}

function FactureCard({ item }: { item: Facture }) {
  return (
    <View style={styles.factureBlock}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
        <Animated.Text style={styles.statusText}>{item.status}</Animated.Text>
      </View>
      <View style={[styles.card, styles.factureCard, { backgroundColor: item.color }]}>
        <Animated.Text style={[styles.cardName, styles.factureName]}>{item.name}</Animated.Text>
        <Pressable hitSlop={8}>
          <Animated.Text style={styles.factureLink}>Voir la{'\n'}facture</Animated.Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Palette.sheet,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.sheetHandle,
    marginBottom: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: AppFonts.display,
    fontSize: 34,
    color: Palette.textDark,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 140,
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
    fontSize: 15,
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
    fontSize: 18,
    color: Palette.textDark,
  },
  cardMeta: {
    fontFamily: AppFonts.regular,
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 15,
    color: Palette.textDark,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
});
