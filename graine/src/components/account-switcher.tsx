import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlurDropdown } from '@/components/blur-dropdown';
import { ACCOUNT_LIST, ACCOUNTS, type Account, type AccountId } from '@/constants/accounts';
import { useAuth } from '@/context/auth';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  blurTarget: RefObject<View | null>;
  /** Compte actuellement actif (placé en tête, non cliquable). */
  currentId: AccountId;
  /** Appelé quand l'utilisateur choisit un autre compte. */
  onSelect: (account: Account) => void;
};

/** Menu de changement de compte, ancré sous l'en-tête « nol ». */
export function AccountSwitcher({ visible, onClose, blurTarget, currentId, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const { configured, hasPro } = useAuth();
  const current = ACCOUNTS[currentId];
  // Le compte pro n'est proposé que si l'utilisateur en possède un
  // (ou en mode démo, quand Supabase n'est pas branché).
  const others = ACCOUNT_LIST.filter(
    (a) => a.id !== currentId && (a.id !== 'pro' || !configured || hasPro),
  );

  return (
    <BlurDropdown
      visible={visible}
      onClose={onClose}
      blurTarget={blurTarget}
      contentStyle={{ top: insets.top + Spacing.two, left: Spacing.three, right: Spacing.six }}>
      <View style={styles.menu}>
        <Pressable style={styles.current} onPress={onClose} hitSlop={8}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{current.name}</Text>
            <Ionicons name="chevron-down" size={18} color={Palette.textDark} />
          </View>
          <Text style={styles.type}>{current.type}</Text>
        </Pressable>

        {others.map((account) => (
          <Pressable
            key={account.id}
            style={({ pressed }) => [styles.accountRow, pressed && styles.accountRowPressed]}
            onPress={() => onSelect(account)}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.handle}>{account.handle}</Text>
              <Text style={styles.type}>{account.type}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </BlurDropdown>
  );
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: Palette.menu,
    borderRadius: 28,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  current: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontFamily: AppFonts.medium,
    fontSize: 24,
    color: Palette.textDark,
  },
  type: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: Palette.textMuted,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 18,
    paddingVertical: Spacing.one,
  },
  accountRowPressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    fontFamily: AppFonts.semibold,
    fontSize: 18,
    color: Palette.textDark,
  },
});
