import { Ionicons } from '@expo/vector-icons';
import { BlurTargetView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountSwitcher } from '@/components/account-switcher';
import { PeriodSelector, type Period } from '@/components/period-selector';
import { useAccount } from '@/context/account';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

const PLOT_HEIGHT = 150;
const MAX_SCANS = 55;
const Y_TICKS = [50, 30, 20, 10, 0];

// Scans par jour : « ce mois ci » (vert) et « mois dernier » (rose).
const SCANS = [
  { current: 30, previous: 22 },
  { current: 38, previous: 25 },
  { current: 35, previous: 38 },
  { current: 25, previous: 27 },
  { current: 50, previous: 25 },
  { current: 30, previous: 35 },
  { current: 42, previous: 30 },
  { current: 38, previous: 28 },
  { current: 52, previous: 13 },
  { current: 40, previous: 33 },
];

export default function ProScreen() {
  const router = useRouter();
  const { setAccountId } = useAccount();
  const blurTarget = useRef<View>(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);
  const [period, setPeriod] = useState<Period>({ key: 'month', label: 'Ce mois ci' });

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTarget} style={styles.blurTarget}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={styles.content}>
            {/* En-tête compte */}
            <View style={styles.header}>
              <Pressable hitSlop={8} onPress={() => setShowAccounts(true)}>
                <View style={styles.nameRow}>
                  <Text style={styles.accountName}>nol</Text>
                  <Ionicons name="chevron-down" size={18} color={Palette.textDark} />
                </View>
                <Text style={styles.accountSubtitle}>Compte pro</Text>
              </Pressable>

              <Pressable hitSlop={8} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={26} color={Palette.textDark} />
              </Pressable>
            </View>

            {/* Sélecteur de période + export */}
            <View style={styles.toolbar}>
              <Pressable
                style={styles.periodTrigger}
                hitSlop={8}
                onPress={() => setShowPeriod(true)}>
                <Text style={styles.periodLabel}>{period.label}</Text>
                <Ionicons name="chevron-down" size={20} color={Palette.textDark} />
              </Pressable>

              <Pressable style={styles.csvButton} hitSlop={8}>
                <Text style={styles.csvLabel}>Télécharger le CSV</Text>
              </Pressable>
            </View>

            {/* Cartes principales */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Palette.cardGreen }]}>
                <Text style={styles.statValue}>98</Text>
                <Text style={styles.statLabel}>clients{'\n'}scannés</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Palette.cardPink }]}>
                <Text style={styles.statValue}>50%</Text>
                <Text style={styles.statLabel}>utilisent le{'\n'}code promo</Text>
                <ProgressBar progress={0.5} track={Palette.pinkTrack} fill={Palette.pinkFill} />
              </View>
            </View>

            {/* Graphique */}
            <Text style={styles.chartTitle}>Nombre de scan par jour</Text>
            <ScanChart />

            {/* Cartes secondaires */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Palette.cardRose }]}>
                <Text style={styles.statValue}>10%</Text>
                <Text style={styles.statLabel}>de clients{'\n'}récurrents</Text>
                <ProgressBar progress={0.1} track={Palette.roseTrack} fill={Palette.roseFill} />
              </View>
              <View style={[styles.statCard, { backgroundColor: Palette.cardBlue }]}>
                <Text style={styles.statValue}>21kg</Text>
                <Text style={styles.statLabel}>de CO2{'\n'}économisé</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurTargetView>

      <AccountSwitcher
        visible={showAccounts}
        onClose={() => setShowAccounts(false)}
        blurTarget={blurTarget}
        currentId="pro"
        onSelect={(account) => {
          setShowAccounts(false);
          setAccountId(account.id);
          router.replace(account.route);
        }}
      />

      <PeriodSelector
        visible={showPeriod}
        onClose={() => setShowPeriod(false)}
        blurTarget={blurTarget}
        value={period.key}
        onChange={setPeriod}
      />
    </View>
  );
}

function ScanChart() {
  return (
    <View style={styles.chart}>
      <View style={styles.legend}>
        <LegendItem color={Palette.chartGreen} label="Ce mois ci" />
        <LegendItem color={Palette.chartPink} label="Mois dernier" />
      </View>

      <View style={styles.chartBody}>
        <View style={[styles.yAxis, { height: PLOT_HEIGHT }]}>
          {Y_TICKS.map((tick) => (
            <Text
              key={tick}
              style={[styles.yLabel, { bottom: (tick / MAX_SCANS) * PLOT_HEIGHT - 9 }]}>
              {tick}
            </Text>
          ))}
        </View>

        <View style={styles.plot}>
          <View style={[styles.bars, { height: PLOT_HEIGHT }]}>
            {SCANS.map((day, i) => (
              <View key={i} style={styles.column}>
                <View style={styles.barStack}>
                  <View
                    style={[
                      styles.bar,
                      { backgroundColor: Palette.chartGreen, height: (day.current / MAX_SCANS) * PLOT_HEIGHT },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      { backgroundColor: Palette.chartPink, height: (day.previous / MAX_SCANS) * PLOT_HEIGHT },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.xAxis}>
            {SCANS.map((_, i) => (
              <View key={i} style={styles.xCell}>
                <Text style={styles.xLabel}>
                  {i === 0 ? '1er' : i === 4 ? '5' : i === 9 ? '10' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({
  progress,
  track,
  fill,
}: {
  progress: number;
  track: string;
  fill: string;
}) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: track }]}>
      <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  blurTarget: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: 140,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  accountName: {
    fontFamily: AppFonts.medium,
    fontSize: 20,
    color: Palette.textDark,
  },
  accountSubtitle: {
    fontFamily: AppFonts.regular,
    fontSize: 14,
    color: Palette.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  periodLabel: {
    fontFamily: AppFonts.display,
    fontSize: 22,
    color: Palette.textDark,
  },
  csvButton: {
    backgroundColor: Palette.buttonGrey,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 22,
  },
  csvLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 14,
    color: Palette.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    borderRadius: 28,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontFamily: AppFonts.display,
    fontSize: 26,
    color: Palette.textDark,
  },
  statLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: Palette.textDark,
    textAlign: 'center',
  },
  chartTitle: {
    fontFamily: AppFonts.regular,
    fontSize: 20,
    color: Palette.textDark,
  },
  chart: {
    gap: Spacing.three,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendSwatch: {
    width: 30,
    height: 16,
    borderRadius: 8,
  },
  legendLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 14,
    color: Palette.textDark,
  },
  chartBody: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 28,
    position: 'relative',
  },
  yLabel: {
    position: 'absolute',
    right: Spacing.two,
    fontFamily: AppFonts.regular,
    fontSize: 12,
    color: Palette.textMuted,
  },
  plot: {
    flex: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    flex: 1,
    height: PLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barStack: {
    width: 22,
    height: PLOT_HEIGHT,
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 11,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
  xCell: {
    flex: 1,
    alignItems: 'center',
  },
  xLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 12,
    color: Palette.textMuted,
    transform: [{ rotate: '-20deg' }],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
