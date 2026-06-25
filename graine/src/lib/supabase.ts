import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * `true` seulement si les variables d'env Supabase sont renseignées.
 * Permet à l'app de tourner en « mode démo » (sans auth) tant que le projet
 * Supabase n'est pas branché — voir le gating dans `context/auth.tsx`.
 */
export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Pas de redirection OAuth par URL en natif.
    detectSessionInUrl: false,
  },
});
