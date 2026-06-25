import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Offer } from '@/constants/offers';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP = { duration: 280, easing: Easing.out(Easing.cubic) };

type Props = {
  /** Offre à afficher ; `null` ferme la feuille. */
  offer: Offer | null;
  onClose: () => void;
};

/** Feuille de détail d'un ticket (clic sur un ticket ou sur un pin de la carte). */
export function TicketDetailSheet({ offer, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Glisse la feuille à l'écran à l'ouverture.
  useEffect(() => {
    if (offer) translateY.value = withTiming(0, SNAP);
  }, [offer, translateY]);

  const dismiss = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, SNAP, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  // Swipe vers le bas pour fermer (comme la feuille « avantages »).
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(e.translationY, 0);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withTiming(SCREEN_HEIGHT, SNAP, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, SNAP);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={!!offer} transparent animationType="none" onRequestClose={dismiss}>
      <GestureHandlerRootView style={styles.fill}>
        {/* Fond transparent : pas d'assombrissement de la carte, tap pour fermer. */}
        <Pressable style={styles.fill} onPress={dismiss} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.five }, sheetStyle]}>
            <View style={styles.handle} />
            {offer && (
              <>
                <Image source={offer.source} style={styles.ticket} contentFit="contain" />
                <Text style={styles.desc}>
                  Vous bénéficiez de {offer.discount}% de réduction dans tout le magasin {offer.brand}.
                </Text>
                <View style={styles.actions}>
                  <Text style={styles.distance}>{offer.distance}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                    hitSlop={8}>
                    <Text style={styles.ctaText}>Itinéraire</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Palette.ticketSheet,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.sheetHandle,
    marginBottom: Spacing.three,
  },
  ticket: {
    // Légèrement débordant du padding pour rester grand, mais ticket entier visible.
    width: SCREEN_WIDTH * 0.96,
    aspectRatio: 393 / 195,
    alignSelf: 'center',
  },
  desc: {
    fontFamily: AppFonts.medium,
    fontSize: 15,
    color: Palette.timelineLine,
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  distance: {
    fontFamily: AppFonts.medium,
    fontSize: 15,
    color: Palette.textDark,
  },
  cta: {
    backgroundColor: Palette.cardGreen,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 24,
  },
  ctaPressed: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: AppFonts.medium,
    fontSize: 14,
    color: Palette.timelineLine,
  },
});
