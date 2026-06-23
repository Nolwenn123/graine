import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistorySheet, PEEK_HEIGHT } from '@/components/history-sheet';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          {/* En-tête compte */}
          <View style={styles.header}>
            <Pressable style={styles.account} hitSlop={8}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>nol</Text>
                <Ionicons name="chevron-down" size={18} color={Palette.textDark} />
              </View>
              <Text style={styles.accountSubtitle}>Compte perso</Text>
            </Pressable>

            <Pressable hitSlop={8}>
              <Ionicons name="settings-outline" size={26} color={Palette.textDark} />
            </Pressable>
          </View>

          {/* Cartes de stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Palette.cardGreen }]}>
              <Text style={styles.statValue}>28kg</Text>
              <Text style={styles.statLabel}>de CO2{'\n'}économisé</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Palette.cardPink }]}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>gestes{'\n'}réalisés</Text>
              <ProgressBar progress={0.4} track={Palette.pinkTrack} fill={Palette.pinkFill} />
            </View>
          </View>

          {/* Plante + niveau */}
          <View style={styles.hero}>
            <Image
              source={require('@/assets/images/plant.png')}
              style={styles.plant}
              contentFit="contain"
            />

            <Text style={styles.levelTitle}>Niveau 6</Text>

            <View style={styles.levelProgress}>
              <Text style={styles.levelNext}>niv 7</Text>
              <ProgressBar progress={0.85} track={Palette.trackLight} fill={Palette.trackFill} />
            </View>

            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <HistorySheet />
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: PEEK_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.three,
  },
  account: {
    gap: 2,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  accountName: {
    fontFamily: AppFonts.medium,
    fontSize: 24,
    color: Palette.textDark,
  },
  accountSubtitle: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: Palette.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  statCard: {
    flex: 1,
    borderRadius: 28,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontFamily: AppFonts.display,
    fontSize: 34,
    color: Palette.textDark,
  },
  statLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 17,
    lineHeight: 23,
    color: Palette.textDark,
    textAlign: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  plant: {
    width: 200,
    height: 210,
  },
  levelTitle: {
    fontFamily: AppFonts.display,
    fontSize: 28,
    color: Palette.textDark,
  },
  levelProgress: {
    alignSelf: 'stretch',
    gap: Spacing.one,
  },
  levelNext: {
    alignSelf: 'flex-end',
    fontFamily: AppFonts.regular,
    fontSize: 16,
    color: Palette.textMuted,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.dotInactive,
  },
  dotActive: {
    backgroundColor: Palette.dotActive,
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
