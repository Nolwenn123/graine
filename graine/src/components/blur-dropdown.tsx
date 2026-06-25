import { BlurView } from 'expo-blur';
import type { ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Vue dont le contenu est capturé puis flouté en arrière-plan (requis sur Android). */
  blurTarget: RefObject<View | null>;
  /** Position de la carte ancrée (top/left/right…). */
  contentStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Menu déroulant ancré sur fond flou : tap en dehors de la carte pour fermer.
 * Contrairement à {@link BlurPopup}, le contenu est positionné par l'appelant
 * (coin haut-gauche…) plutôt que centré.
 */
export function BlurDropdown({ visible, onClose, blurTarget, contentStyle, children }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <BlurView
      intensity={40}
      tint="light"
      blurMethod="dimezisBlurView"
      blurTarget={blurTarget}
      style={styles.overlay}>
      {/* Fond plein écran : un tap ferme le menu. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      {/* La carte absorbe les touches pour ne pas refermer le menu au clic dessus. */}
      <View
        style={[styles.content, contentStyle]}
        onStartShouldSetResponder={() => true}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
  },
});
