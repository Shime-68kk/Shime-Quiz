import { DEFAULT_UI_LOCALE, UI_LOCALES, translateUi } from './localeRuntime.js';

export const SHIME_LOCALES = UI_LOCALES;
export const SHIME_DEFAULT_LOCALE = DEFAULT_UI_LOCALE;

const TERMINOLOGY_KEYS = [
  'shimeRobot', 'shimeQuiz', 'companionControlCenter', 'deviceBridge',
  'cognitiveEngineV2', 'dryRun', 'notSent', 'redactedCoarseData',
  'learningStateCapsule', 'memoryBrain', 'transportBrain', 'safetyGovernor',
  'fsrsMemorySignal'
];

function buildTerminology(locale) {
  return Object.freeze(Object.fromEntries(
    TERMINOLOGY_KEYS.map(key => [key, translateUi(`legacy.${key}`, locale)])
  ));
}
export const SHIME_TERMINOLOGY = Object.freeze({
  vi: buildTerminology('vi'),
  en: buildTerminology('en')
});

const LEGACY_KEY_ALIASES = Object.freeze({
  navDashboard: 'nav.overview',
  navLibrary: 'nav.library',
  navStudyRoom: 'nav.studyRoom',
  navSettings: 'nav.settings',
  settingsTitle: 'settings.title',
  settingsTheme: 'settings.themeTitle',
  settingsLanguage: 'legacy.settingsLanguage',
  settingsFsrs: 'settings.fsrsTitle'
});

export function getUiString(key, locale = SHIME_DEFAULT_LOCALE) {
  if (TERMINOLOGY_KEYS.includes(key)) return translateUi(`legacy.${key}`, locale);
  return translateUi(LEGACY_KEY_ALIASES[key] || key, locale);
}
