import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

type SettingsItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ITEMS: SettingsItem[] = [
  { key: 'infos', label: 'Informations personnelles', icon: 'information-circle' },
  { key: 'privacy', label: 'Confidentialité', icon: 'lock-closed' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { configured, session, signOut } = useAuth();
  const [query, setQuery] = useState('');

  const items = ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable hitSlop={10} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={Palette.textDark} />
            </Pressable>
            <Text style={styles.title}>Paramètres</Text>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Palette.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher"
              placeholderTextColor={Palette.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>

          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                hitSlop={8}>
                <Ionicons name={item.icon} size={40} color={Palette.textDark} />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {configured && session && (
            <Pressable
              style={({ pressed }) => [styles.logout, pressed && styles.rowPressed]}
              hitSlop={8}
              onPress={() => signOut()}>
              <Ionicons name="log-out-outline" size={26} color="#C0392B" />
              <Text style={styles.logoutLabel}>Déconnexion</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
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
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    fontFamily: AppFonts.display,
    fontSize: 34,
    color: Palette.textDark,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: 26,
    backgroundColor: Palette.buttonGrey,
  },
  searchInput: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 17,
    color: Palette.textDark,
    paddingVertical: 0,
  },
  list: {
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLabel: {
    fontFamily: AppFonts.regular,
    fontSize: 20,
    color: Palette.textDark,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: 'auto',
    marginBottom: Spacing.six,
  },
  logoutLabel: {
    fontFamily: AppFonts.medium,
    fontSize: 18,
    color: '#C0392B',
  },
});
