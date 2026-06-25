import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
// Animation de calage sans rebond : décélération régulière.
const SNAP = { duration: 280, easing: Easing.out(Easing.cubic) };

export const DEFAULT_PEEK_HEIGHT = 150;

export type DraggableSheetProps = {
  /** Contenu fixe de la zone d'en-tête (glissable) : titre, sous-titre, icône… */
  header: ReactNode;
  /** Contenu défilant de la feuille. */
  children: ReactNode;
  /** Hauteur visible quand la feuille est repliée. */
  peekHeight?: number;
  /** Décalage sous la safe-area quand la feuille est dépliée. */
  topInset?: number;
  /** Ouvre la feuille dépliée dès l'affichage. */
  initiallyExpanded?: boolean;
  background?: string;
  handleColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function DraggableSheet({
  header,
  children,
  peekHeight = DEFAULT_PEEK_HEIGHT,
  topInset = 56,
  initiallyExpanded = false,
  background = Palette.sheet,
  handleColor = Palette.sheetHandle,
  contentContainerStyle,
}: DraggableSheetProps) {
  const insets = useSafeAreaInsets();

  const expandedTop = insets.top + topInset;
  const sheetHeight = SCREEN_HEIGHT - expandedTop;
  const collapsedOffset = sheetHeight - peekHeight;

  const initialOffset = initiallyExpanded ? 0 : collapsedOffset;
  const translateY = useSharedValue(initialOffset);
  const startY = useSharedValue(initialOffset);

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
      translateY.value = withTiming(expand ? 0 : collapsedOffset, SNAP);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.sheet,
        { top: expandedTop, height: sheetHeight, backgroundColor: background },
        sheetStyle,
      ]}>
      <GestureDetector gesture={pan}>
        <View style={styles.headerZone}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
          {header}
        </View>
      </GestureDetector>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  headerZone: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 5,
    borderRadius: 3,
    marginBottom: Spacing.four,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 140,
  },
});
