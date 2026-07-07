import { createContext, useMemo, useState } from 'react';
import { SHIME_DEFAULT_LOCALE, SHIME_LOCALES, getUiString } from './shimeUiCopyProposal.js';

export const ShimeLanguageContext = createContext({
  locale: SHIME_DEFAULT_LOCALE,
  setLocale: () => {},
  t: key => getUiString(key, SHIME_DEFAULT_LOCALE)
});

function normalizeLocale(locale) {
  return locale === SHIME_LOCALES.EN ? SHIME_LOCALES.EN : SHIME_LOCALES.VI;
}

export function ShimeLanguageProvider({ children, initialLocale = SHIME_DEFAULT_LOCALE }) {
  const [locale, setLocaleState] = useState(() => normalizeLocale(initialLocale));
  const value = useMemo(() => ({
    locale,
    setLocale: nextLocale => setLocaleState(normalizeLocale(nextLocale)),
    t: key => getUiString(key, locale)
  }), [locale]);

  return (
    <ShimeLanguageContext.Provider value={value}>
      {children}
    </ShimeLanguageContext.Provider>
  );
}

export { normalizeLocale };
