import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { formatUSD, formatDual } from '@/lib/currency';

type DisplayMode = 'usd' | 'dual';

interface CurrencyContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  formatAmount: (amount: number) => string;
}

const STORAGE_KEY = 'sm_currency_mode';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'usd' || stored === 'dual') return stored;
    } catch { /* ignore */ }
    return 'usd';
  });

  const setDisplayMode = (mode: DisplayMode) => {
    setDisplayModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { /* ignore */ }
  };

  const formatAmount = (amount: number): string => {
    if (displayMode === 'dual') return formatDual(amount);
    return formatUSD(amount);
  };

  return (
    <CurrencyContext.Provider value={{ displayMode, setDisplayMode, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}