import { BlurView } from 'expo-blur';
import type { ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Vue dont le contenu est capturé puis flouté en arrière-plan (requis sur Android). */
  blurTarget: RefObject<View | null>;
  children: ReactNode;
};

/** Popup centrée sur fond flou ; tap en dehors pour fermer. */
export function BlurPopup({ visible, onClose, blurTarget, children }: Props) {
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
      <Pressable style={styles.center} onPress={onClose}>
        {children}
      </Pressable>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
