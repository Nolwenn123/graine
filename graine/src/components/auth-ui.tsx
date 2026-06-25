import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppFonts, Palette, Spacing } from '@/constants/theme';

/** Enveloppe commune aux écrans Connexion / Inscription. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <Image
              source={require('@/assets/images/plant.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.brandName}>graine</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.form}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthField({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={Palette.searchPlaceholder}
        {...props}
      />
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  brand: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logo: { width: 96, height: 100 },
  brandName: {
    fontFamily: AppFonts.display,
    fontSize: 30,
    color: Palette.textDark,
  },
  title: {
    fontFamily: AppFonts.display,
    fontSize: 32,
    color: Palette.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: AppFonts.regular,
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  form: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  field: { gap: Spacing.one },
  label: {
    fontFamily: AppFonts.medium,
    fontSize: 15,
    color: Palette.textDark,
    marginLeft: Spacing.two,
  },
  input: {
    height: 54,
    paddingHorizontal: Spacing.three,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Palette.searchOutline,
    fontFamily: AppFonts.regular,
    fontSize: 17,
    color: Palette.textDark,
  },
  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Palette.buttonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: {
    fontFamily: AppFonts.semibold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  error: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: '#C0392B',
    textAlign: 'center',
  },
});
