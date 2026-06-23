import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppFonts, Palette } from '@/constants/theme';

type TabItem = {
  path: '/' | '/dashboard' | '/explore';
  label: string;
  icon: (active: boolean, color: string) => React.ReactNode;
};

const TABS: TabItem[] = [
  {
    path: '/dashboard',
    label: 'Tableau',
    icon: (_active, color) => (
      <MaterialCommunityIcons name="card-outline" size={22} color={color} />
    ),
  },
  {
    path: '/explore',
    label: 'Explorer',
    icon: (_active, color) => (
      <MaterialCommunityIcons name="view-agenda-outline" size={22} color={color} />
    ),
  },
  {
    path: '/',
    label: 'Profil',
    icon: (active, color) => (
      <Ionicons name={active ? 'person' : 'person-outline'} size={22} color={color} />
    ),
  },
];

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Pill>
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const color = active ? '#FFFFFF' : 'rgba(40,50,30,0.75)';
          return (
            <Pressable
              key={tab.path}
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
