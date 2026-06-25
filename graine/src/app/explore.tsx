import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapView, type MapHandle, type Store } from '@/components/map-view';
import { TicketDetailSheet } from '@/components/ticket-detail-sheet';
import { TicketsSheet } from '@/components/tickets-sheet';
import { offerForBrand, type Offer } from '@/constants/offers';
import { AppFonts, Palette } from '@/constants/theme';

const STORES: Store[] = [
  { id: '1', name: 'Notting Hill', brand: 'Biocoop', lat: 51.515, lng: -0.203 },
  { id: '2', name: 'Ealing', brand: 'Naturalia', lat: 51.513, lng: -0.301 },
  { id: '3', name: 'Hammersmith', brand: 'Biocoop', lat: 51.492, lng: -0.223 },
  { id: '4', name: 'Kensington', brand: 'Kusmi Tea', lat: 51.498, lng: -0.19 },
  { id: '5', name: 'Camden', brand: 'La Vie Claire', lat: 51.539, lng: -0.143 },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapHandle>(null);
  const [query, setQuery] = useState('');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);

  const onSubmit = () => {
    const q = query.trim();
    if (!q) return;
    Keyboard.dismiss();
    mapRef.current?.search(q);
  };

  const openOffer = (o: Offer) => {
    const store = STORES.find((s) => s.brand === o.brand);
    if (store) mapRef.current?.focus(store.lat, store.lng);
    setTicketsExpanded(true);
    setOffer(o);
  };

  // Clic sur un pin de la carte : ouvre le détail du ticket correspondant.
  const openFromPin = (brand: string) => {
    const o = offerForBrand(brand);
    if (!o) return;
    setTicketsExpanded(true);
    setOffer(o);
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        stores={STORES}
        onStorePress={openFromPin}
      />

      {/* Barre de recherche */}
      <View style={[styles.searchBar, { top: insets.top + 52 }]}>
        <Ionicons name="search" size={20} color={Palette.searchPlaceholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor={Palette.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {!offer && <TicketsSheet onSelect={openOffer} initiallyExpanded={ticketsExpanded} />}

      <TicketDetailSheet offer={offer} onClose={() => setOffer(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  searchBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: Palette.searchBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 17,
    color: Palette.textDark,
    paddingVertical: 0,
  },
});
