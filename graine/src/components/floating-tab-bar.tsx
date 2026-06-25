import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAccount } from '@/context/account';
import { AppFonts, Palette } from '@/constants/theme';

type TabPath = '/' | '/dashboard' | '/explore' | '/clients' | '/pro';

type TabItem = {
  path: TabPath;
  label: string;
  icon: (active: boolean, color: string) => React.ReactNode;
  /** Routes supplémentaires qui gardent cet onglet actif. */
  alsoActiveOn?: string[];
};

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { accountId } = useAccount();
  const isPro = accountId === 'pro';

  // En compte pro, l'onglet du milieu devient « Clients » et le Profil pointe sur /pro.
  const tabs: TabItem[] = [
    {
      path: '/dashboard',
      label: 'Accueil',
      icon: (_active, color) => (
        <MaterialCommunityIcons name="card-outline" size={22} color={color} />
      ),
    },
    isPro
      ? {
          path: '/clients',
          label: 'Clients',
          icon: (_active, color) => (
            <MaterialCommunityIcons name="view-agenda-outline" size={22} color={color} />
          ),
        }
      : {
          path: '/explore',
          label: 'Avantages',
          icon: (_active, color) => (
            <MaterialCommunityIcons name="view-agenda-outline" size={22} color={color} />
          ),
        },
    {
      path: isPro ? '/pro' : '/',
      label: 'Profil',
      icon: (active, color) => (
        <Ionicons name={active ? 'person' : 'person-outline'} size={22} color={color} />
      ),
      alsoActiveOn: ['/settings'],
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Pill>
        {tabs.map((tab) => {
          const active = pathname === tab.path || (tab.alsoActiveOn?.includes(pathname) ?? false);
          const color = active ? '#FFFFFF' : 'rgba(40,50,30,0.75)';
          return (
            <Pressable
              key={tab.label}
              onPress={() => router.replace(tab.path)}
              style={[styles.item, active && styles.itemActive]}
              hitSlop={8}>
              {tab.icon(active, color)}
              {active && (
                <ThemedText style={styles.itemLabel} themeColor="text">
                  {tab.label}
                </ThemedText>
              )}
            </Pressable>
          );
        })}
      </Pill>
    </View>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView style={styles.pill} glassEffectStyle="regular" tintColor={Palette.pillBg}>
        {children}
      </GlassView>
    );
  }
  return <View style={[styles.pill, styles.pillFallback]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 40,
    overflow: 'hidden',
  },
  pillFallback: {
    backgroundColor: Palette.pillBg,
    borderWidth: 1,
    borderColor: Palette.pillBorder,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
  },
  itemActive: {
    backgroundColor: Palette.pillActive,
    paddingHorizontal: 20,
  },
  itemLabel: {
    color: '#FFFFFF',
    fontFamily: AppFonts.medium,
    fontSize: 16,
  },
});
