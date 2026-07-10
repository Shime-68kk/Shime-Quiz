import { DEFAULT_UI_LOCALE, normalizeUiLocale } from './localeRuntime.js';

export const UI_LOCALE_STORAGE_KEY = 'shime.ui.locale.v1';

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window !== 'undefined') return window.localStorage;
  return null;
}

export function readStoredUiLocale(storage) {
  try {
    const value = getStorage(storage)?.getItem(UI_LOCALE_STORAGE_KEY);
    return value === 'vi' || value === 'en' ? value : DEFAULT_UI_LOCALE;
  } catch {
    return DEFAULT_UI_LOCALE;
  }
}

export function writeStoredUiLocale(locale, storage) {
  const normalized = normalizeUiLocale(locale);
  try {
    getStorage(storage)?.setItem(UI_LOCALE_STORAGE_KEY, normalized);
  } catch {
    // The in-memory preference remains usable when browser storage is unavailable.
  }
  return normalized;
}

export function initializeUiLocale(storage) {
  const locale = readStoredUiLocale(storage);
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  return locale;
}
