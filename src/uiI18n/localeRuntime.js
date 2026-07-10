import { en } from './translations/en.js';
import { vi } from './translations/vi.js';

export const UI_LOCALES = Object.freeze({ VI: 'vi', EN: 'en' });
export const DEFAULT_UI_LOCALE = UI_LOCALES.VI;

export const UI_TRANSLATIONS = Object.freeze({ vi, en });

export function normalizeUiLocale(locale) {
  return locale === UI_LOCALES.EN ? UI_LOCALES.EN : DEFAULT_UI_LOCALE;
}

function interpolate(message, values) {
  if (!values) return message;
  return message.replace(/\{(\w+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

export function translateUi(key, locale = DEFAULT_UI_LOCALE, values) {
  const normalizedLocale = normalizeUiLocale(locale);
  const message = UI_TRANSLATIONS[normalizedLocale][key] ?? UI_TRANSLATIONS.vi[key];
  return interpolate(message ?? key, values);
}

export function getUiTranslationKeys(locale) {
  return Object.keys(UI_TRANSLATIONS[normalizeUiLocale(locale)]).sort();
}

