import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton, AuthError, AuthField, AuthLayout } from '@/components/auth-ui';
import { useAuth } from '@/context/auth';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

type AccountType = 'perso' | 'pro';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('perso');
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPro = accountType === 'pro';

  const onSubmit = async () => {
    setError(null);
    if (!username.trim()) {
      setError('Choisissez un pseudo.');
      return;
    }
    if (isPro && !businessName.trim()) {
      setError('Indiquez le nom de votre établissement.');
      return;
    }
    setLoading(true);
    const { error: signUpError, needsConfirmation } = await signUp({
      email: email.trim(),
      password,
      username: username.trim(),
      accountType,
      businessName: isPro ? businessName.trim() : undefined,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsConfirmation) {
      Alert.alert(
        'Vérifiez vos e-mails',
        'Un lien de confirmation vous a été envoyé pour activer votre compte.',
      );
      router.replace('/login');
      return;
    }
    router.replace('/');
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Récompensez vos gestes écolo 🌱"
      footer={
        <Link href="/login" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.footerText}>
              Déjà un compte ? <Text style={styles.footerLink}>Se connecter</Text>
            </Text>
          </Pressable>
        </Link>
      }>
      {/* Choix du type de compte */}
      <View style={styles.toggle}>
        <TypeButton
          label="Compte perso"
          active={!isPro}
          onPress={() => setAccountType('perso')}
        />
        <TypeButton label="Compte pro" active={isPro} onPress={() => setAccountType('pro')} />
      </View>

      <AuthField
        label="Pseudo"
        placeholder="nolwenn_br"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {isPro && (
        <AuthField
          label="Nom de l’établissement"
          placeholder="Maison Graine"
          value={businessName}
          onChangeText={setBusinessName}
        />
      )}

      <AuthField
        label="E-mail"
        placeholder="vous@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      <AuthField
        label="Mot de passe"
        placeholder="6 caractères minimum"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <AuthError message={error} />

      <AuthButton label="S’inscrire" onPress={onSubmit} loading={loading} />
    </AuthLayout>
  );
}

function TypeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeButton, active && styles.typeButtonActive]}>
      <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.one,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 24,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Palette.buttonGreen,
  },
  typeLabel: {
    fontFamily: AppFonts.medium,
    fontSize: 15,
    color: Palette.textMuted,
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },
  footerText: {
    fontFamily: AppFonts.regular,
    fontSize: 16,
    color: Palette.textMuted,
  },
  footerLink: {
    fontFamily: AppFonts.semibold,
    color: Palette.textDark,
  },
});
