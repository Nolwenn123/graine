/** Comptes disponibles dans le sélecteur (perso ↔ pro). */

export type AccountId = 'perso' | 'pro';

export type Account = {
  id: AccountId;
  /** Nom court affiché dans l'en-tête (« nol »). */
  name: string;
  /** Pseudo affiché dans la ligne du menu (« nolwenn_br »). */
  handle: string;
  /** Sous-titre (« Compte perso » / « Compte pro »). */
  type: string;
  /** Route de la page associée. */
  route: '/' | '/pro';
};

export const ACCOUNTS: Record<AccountId, Account> = {
  perso: { id: 'perso', name: 'nol', handle: 'nol', type: 'Compte perso', route: '/' },
  pro: { id: 'pro', name: 'nol', handle: 'nolwenn_br', type: 'Compte pro', route: '/pro' },
};

export const ACCOUNT_LIST: Account[] = [ACCOUNTS.perso, ACCOUNTS.pro];
