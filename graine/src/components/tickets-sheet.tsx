import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DraggableSheet } from '@/components/draggable-sheet';
import { OFFERS, type Offer } from '@/constants/offers';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

type Props = {
  /** Appelé quand un ticket est touché — ouvre sa feuille de détail. */
  onSelect: (offer: Offer) => void;
  /** Affiche la feuille déjà dépliée. */
  initiallyExpanded?: boolean;
};

export function TicketsSheet({ onSelect, initiallyExpanded }: Props) {
  return (
    <DraggableSheet
      background={Palette.ticketSheet}
      topInset={116}
      initiallyExpanded={initiallyExpanded}
      header={
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Mes tickets avantages</Text>
            <Ionicons name="funnel-outline" size={24} color={Palette.timelineLine} />
          </View>
          <Text style={styles.subtitle}>Cliquez sur un ticket pour afficher son QR Code</Text>
        </View>
      }>
      <View style={styles.list}>
        {OFFERS.map((offer) => (
          <Pressable
            key={offer.id}
            onPress={() => onSelect(offer)}
            style={({ pressed }) => [styles.ticket, pressed && styles.ticketPressed]}>
            <Image source={offer.source} style={styles.ticketImage} contentFit="contain" />
          </Pressable>
        ))}
      </View>
    </DraggableSheet>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: AppFonts.display,
    fontSize: 28,
    color: Palette.textDark,
  },
  subtitle: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: Palette.sectionLabel,
    marginTop: Spacing.two,
  },
  list: {
    // Étire les tickets au-delà du padding latéral de la feuille pour
    // qu'ils soient quasi bord à bord, comme sur la maquette.
    marginHorizontal: -Spacing.three,
  },
  ticket: {
    width: '100%',
    // Marge négative pour rapprocher les tickets, quitte à ce que les
    // ronds blancs se chevauchent légèrement (cf. maquette).
    marginBottom: -Spacing.five,
  },
  ticketPressed: {
    opacity: 0.7,
  },
  ticketImage: {
    width: '100%',
    aspectRatio: 393 / 195,
  },
});
