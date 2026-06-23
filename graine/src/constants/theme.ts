/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Polices de l'app — chargées dans `_layout.tsx` via `useFonts`.
 * Poppins pour le corps de texte, Playfair Display Bold pour les titres.
 */
export const AppFonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  display: 'PlayfairDisplay_700Bold',
} as const;

/**
 * Palette issue de la maquette Figma (écran d'accueil + historique).
 */
export const Palette = {
  background: '#F2F1ED',
  textDark: '#1A1A1A',
  textMuted: '#6E6E6E',

  // Cartes de stats
  cardGreen: '#CADCB6',
  cardPink: '#DCC1D4',

  // Barres de progression
  trackLight: '#DAD9D4',
  trackFill: '#4F4F4D',
  pinkTrack: 'rgba(0,0,0,0.08)',
  pinkFill: '#8A6E82',

  // Pastilles de pagination
  dotActive: '#4F4F4D',
  dotInactive: '#C9C8C2',

  // Feuille « Historique »
  sheet: '#CCDFBE',
  sheetHandle: '#A9C194',
  timelineLine: '#5C7A4E',
  sectionLabel: '#6E7B63',

  // Cartes de la timeline
  itemGrey: '#CBCBC9',
  itemGreen: '#A6C394',
  itemPink: '#D5A6A6',
  itemBeige: '#C6B79D',
  itemBlueGrey: '#A6BFC0',

  // Statuts
  statusVerified: '#4CAF50',
  statusPending: '#F5A623',

  // Barre de navigation flottante (pilule en verre)
  pillBg: 'rgba(120, 150, 95, 0.45)',
  pillBorder: 'rgba(255,255,255,0.35)',
  pillActive: 'rgba(90, 120, 70, 0.55)',
} as const;
