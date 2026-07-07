# Future Integration Plan for Codex

This document provides a technical roadmap for Codex to implement full application-wide internationalization (i18n).

---

## 1. Local State Persistence
Once the planning phase is approved, Codex should add a local-first persistence layer for the selected language:
*   Add a `locale` field to the application's local settings schema.
*   Upon language selection, update the state via the state manager.
*   Do not send this preference to external clouds or telemetry.

---

## 2. Global State Integration & React Context
To propagate language changes throughout all UI components without prop drilling:
*   Implement a `LanguageProvider` wrapper inside the top-level App context.
*   Export a React hook: `const { locale, setLocale, t } = useLanguage();`.
*   The `t` function should call our safe copy accessor `getUiString(key, locale)` to fetch translated strings.

Example usage:
```jsx
import { useLanguage } from '../state/LanguageContext.jsx';

export default function Library() {
  const { t } = useLanguage();
  return (
    <h1>{t('navLibrary')}</h1>
  );
}
```

---

## 3. Automated Test Verification
Ensure that Codex adds unit and integration tests confirming:
*   All visible labels translate properly when the language state changes.
*   Language selection does not persist sensitive learning data in localStorage.
*   Fallback matches default to Vietnamese ('vi') for missing keys or unsupported locales.
