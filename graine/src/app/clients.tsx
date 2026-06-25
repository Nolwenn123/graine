import { Ionicons } from '@expo/vector-icons';
import { BlurTargetView } from 'expo-blur';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlurPopup } from '@/components/blur-popup';
import { CLIENTS, type Client } from '@/constants/clients';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

export default function ClientsScreen() {
  const blurTarget = useRef<View>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  const clients = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTarget} style={styles.blurTarget}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={styles.content}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Palette.searchPlaceholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher"
                placeholderTextColor={Palette.searchPlaceholder}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
            </View>

            <Text style={styles.title}>Liste des clients scannés</Text>

            <View style={styles.list}>
              {clients.map((client) => (
                <Pressable
                  key={client.id}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => setSelected(client)}>
                  <Avatar client={client} size={48} />
                  <Text style={styles.name}>{client.name}</Text>
                  <Text style={styles.link}>Voir le profil</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurTargetView>

      <BlurPopup
        visible={selected !== null}
        onClose={() => setSelected(null)}
        blurTarget={blurTarget}>
        {selected && <ClientDetailCard client={selected} />}
      </BlurPopup>
    </View>
  );
}

function ClientDetailCard({ client }: { client: Client }) {
  return (
    // Absorbe les touches : un tap sur la carte ne referme pas le popup.
    <View style={styles.card} onStartShouldSetResponder={() => true}>
      <View style={styles.cardHeader}>
        <Avatar client={client} size={48} />
        <Text style={styles.cardName}>{client.name}</Text>
      </View>

      <View style={styles.cardLines}>
        <Text style={styles.cardLine}>Scanné le {client.scannedAt}</Text>
        <Text style={styles.cardLine}>Réduction : {client.discount}</Text>
        <Text style={styles.cardLine}>Prix sans réduction : {client.priceBefore}</Text>
        <Text style={styles.cardLine}>Prix avec réduction : {client.priceAfter}</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.pdfButton, pressed && styles.pdfButtonPressed]}>
        <Text style={styles.pdfLabel}>Facture PDF</Text>
      </Pressable>
    </View>
  );
}

function Avatar({ client, size }: { client: Client; size: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: client.avatarColor },
      ]}>
      <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>
        {client.name.charAt(0)}
      </Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Palette.searchOutline,
    backgroundColor: 'rgba(202,220,182,0.12)',
  },
  searchInput: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 17,
    color: Palette.textDark,
    paddingVertical: 0,
  },
  title: {
    fontFamily: AppFonts.display,
    fontSize: 30,
    color: Palette.textDark,
  },
  list: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowPressed: {
    opacity: 0.6,
  },
  name: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 20,
    color: Palette.textDark,
  },
  link: {
    fontFamily: AppFonts.regular,
    fontSize: 17,
    color: Palette.textDark,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: AppFonts.semibold,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: Palette.popupCard,
    borderRadius: 28,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: 360,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardName: {
    fontFamily: AppFonts.semibold,
    fontSize: 22,
    color: Palette.textDark,
  },
  cardLines: {
    gap: Spacing.two,
  },
  cardLine: {
    fontFamily: AppFonts.regular,
    fontSize: 18,
    color: Palette.textDark,
  },
  pdfButton: {
    alignSelf: 'center',
    backgroundColor: Palette.buttonGreen,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: 22,
    marginTop: Spacing.one,
  },
  pdfButtonPressed: {
    opacity: 0.85,
  },
  pdfLabel: {
    fontFamily: AppFonts.medium,
    fontSize: 17,
    color: '#FFFFFF',
  },
});
