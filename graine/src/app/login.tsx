import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthButton, AuthError, AuthField, AuthLayout } from '@/components/auth-ui';
import { useAuth } from '@/context/auth';
import { AppFonts, Palette } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace('/');
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Heureux de vous revoir 🌱"
      footer={
        <Link href="/signup" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.footerText}>
              Pas encore de compte ? <Text style={styles.footerLink}>S’inscrire</Text>
            </Text>
          </Pressable>
        </Link>
      }>
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
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <AuthError message={error} />

      <AuthButton label="Se connecter" onPress={onSubmit} loading={loading} />

      <Text style={styles.demo}>Démo : admin@graine.app / admin</Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontFamily: AppFonts.regular,
    fontSize: 16,
    color: Palette.textMuted,
  },
  footerLink: {
    fontFamily: AppFonts.semibold,
    color: Palette.textDark,
  },
  demo: {
    fontFamily: AppFonts.regular,
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
