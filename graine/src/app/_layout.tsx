import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FloatingTabBar } from '@/components/floating-tab-bar';
import { AccountProvider } from '@/context/account';
import { AuthProvider, useAuth } from '@/context/auth';
import { Palette } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const AUTH_ROUTES = ['/login', '/signup'];

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AccountProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </ThemeProvider>
        </AccountProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

/** Navigation + redirection auth + barre d'onglets conditionnelle. */
function RootNavigator() {
  const { configured, loading, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onAuthRoute = AUTH_ROUTES.includes(pathname);

  // Gating : redirige vers /login si non connecté (uniquement si Supabase est branché).
  useEffect(() => {
    if (!configured || loading) {
      return;
    }
    if (!session && !onAuthRoute) {
      router.replace('/login');
    } else if (session && onAuthRoute) {
      router.replace('/');
    }
  }, [configured, loading, session, onAuthRoute, router]);

  // Évite d'afficher une page protégée le temps de résoudre la session.
  if (configured && loading) {
    return <View style={{ flex: 1, backgroundColor: Palette.background }} />;
  }

  const showTabBar = (!configured || session !== null) && !onAuthRoute;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="pro" />
        <Stack.Screen name="clients" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
      {showTabBar && <FloatingTabBar />}
    </>
  );
}
