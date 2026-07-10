import { createContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_UI_LOCALE, translateUi, normalizeUiLocale } from './localeRuntime.js';
import { readStoredUiLocale, writeStoredUiLocale } from './localeStorage.js';

export const ShimeLanguageContext = createContext({
  locale: DEFAULT_UI_LOCALE,
  setLocale: () => {},
  t: (key, values) => translateUi(key, DEFAULT_UI_LOCALE, values)
});

const normalizeLocale = normalizeUiLocale;

export function ShimeLanguageProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => (
    initialLocale === undefined ? readStoredUiLocale() : normalizeLocale(initialLocale)
  ));
  const value = useMemo(() => ({
    locale,
    setLocale: nextLocale => {
      const normalized = writeStoredUiLocale(nextLocale);
      if (typeof document !== 'undefined') document.documentElement.lang = normalized;
      setLocaleState(normalized);
    },
    t: (key, values) => translateUi(key, locale, values)
  }), [locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  return (
    <ShimeLanguageContext.Provider value={value}>
      {children}
    </ShimeLanguageContext.Provider>
  );
}

export { normalizeLocale };
