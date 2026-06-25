import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { AccountId } from '@/constants/accounts';

type AccountContextValue = {
  /** Compte actuellement actif dans toute l'app (perso ↔ pro). */
  accountId: AccountId;
  setAccountId: (id: AccountId) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

/** Fournit le compte actif à l'app entière (navbar incluse). */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<AccountId>('perso');
  const value = useMemo(() => ({ accountId, setAccountId }), [accountId]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error('useAccount doit être utilisé dans un <AccountProvider>');
  }
  return ctx;
}
