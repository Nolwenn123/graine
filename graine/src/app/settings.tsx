import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccount } from '@/context/account';
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
  const { signOut } = useAuth();
  const { setAccountId } = useAccount();
  const [query, setQuery] = useState('');

  const items = ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onLogout = async () => {
    setAccountId('perso'); // on repart du compte perso à la prochaine connexion
    await signOut();
    router.replace('/login');
  };

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

          <Pressable
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
            onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color="#C0392B" />
            <Text style={styles.logoutLabel}>Se déconnecter</Text>
          </Pressable>
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
    fontSize: 28,
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
    fontSize: 16,
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
    fontSize: 16,
    color: Palette.textDark,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: 'auto',
    marginBottom: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.4)',
    backgroundColor: 'rgba(192,57,43,0.06)',
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutLabel: {
    fontFamily: AppFonts.medium,
    fontSize: 15,
    color: '#C0392B',
  },
});
