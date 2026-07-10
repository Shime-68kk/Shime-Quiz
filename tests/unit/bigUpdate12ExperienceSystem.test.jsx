import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_UI_LOCALE, getUiTranslationKeys, translateUi } from '../../src/uiI18n/localeRuntime.js';
import { readStoredUiLocale, UI_LOCALE_STORAGE_KEY, writeStoredUiLocale } from '../../src/uiI18n/localeStorage.js';
import {
  DEFAULT_UI_THEME,
  REQUIRED_THEME_ROLES,
  UI_THEME_IDS,
  UI_THEME_STORAGE_KEY,
  applyUiTheme,
  readStoredUiTheme
} from '../../src/uiTheme/themeRuntime.js';
import { UI_THEME_DEFINITIONS } from '../../src/uiTheme/themeDefinitions.js';
import { contrastRatio } from '../../src/uiTheme/contrast.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    writes,
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { writes.push([key, String(value)]); values.set(key, String(value)); },
    dump: () => Object.fromEntries(values)
  };
}

describe('BIG-UPDATE-12 canonical locale runtime', () => {
  it('keeps Vietnamese and English key sets identical', () => {
    expect(getUiTranslationKeys('vi')).toEqual(getUiTranslationKeys('en'));
    expect(getUiTranslationKeys('vi').length).toBeGreaterThan(700);
  });

  it('falls back to Vietnamese deterministically for unknown locale and missing locale values', () => {
    expect(DEFAULT_UI_LOCALE).toBe('vi');
    expect(translateUi('settings.title', 'unknown')).toBe('Cài đặt');
    expect(translateUi('missing.translation.key', 'en')).toBe('missing.translation.key');
  });

  it('persists only the dedicated locale key and safely rejects corrupt values', () => {
    const storage = createStorage({ [UI_THEME_STORAGE_KEY]: 'dark' });
    expect(writeStoredUiLocale('en', storage)).toBe('en');
    expect(storage.writes).toEqual([[UI_LOCALE_STORAGE_KEY, 'en']]);
    expect(storage.dump()[UI_THEME_STORAGE_KEY]).toBe('dark');
    expect(readStoredUiLocale(createStorage({ [UI_LOCALE_STORAGE_KEY]: 'fr' }))).toBe('vi');
  });

  it('mounts one provider above all routes', () => {
    const main = read('src/main.jsx');
    expect(main).toContain('<ShimeLanguageProvider>');
    expect(main.indexOf('<ShimeLanguageProvider>')).toBeLessThan(main.indexOf('<Routes>'));
  });
});

describe('BIG-UPDATE-12 semantic themes and contrast', () => {
  it('defines all five themes with every required semantic role', () => {
    expect(Object.keys(UI_THEME_DEFINITIONS)).toEqual(UI_THEME_IDS);
    for (const definition of Object.values(UI_THEME_DEFINITIONS)) {
      expect(Object.keys(definition.roles).sort()).toEqual([...REQUIRED_THEME_ROLES].sort());
    }
  });

  it('falls back invalid themes and persists only the theme key', () => {
    const storage = createStorage({ [UI_LOCALE_STORAGE_KEY]: 'en' });
    expect(readStoredUiTheme(createStorage({ [UI_THEME_STORAGE_KEY]: 'neon' }))).toBe(DEFAULT_UI_THEME);
    expect(applyUiTheme('ocean', { storage })).toBe('ocean');
    expect(storage.writes).toEqual([[UI_THEME_STORAGE_KEY, 'ocean']]);
    expect(storage.dump()[UI_LOCALE_STORAGE_KEY]).toBe('en');
  });

  it('meets 4.5:1 for critical body, muted, accent, safe, and warning pairs', () => {
    for (const { roles } of Object.values(UI_THEME_DEFINITIONS)) {
      const pairs = [
        ['text-primary', 'canvas'],
        ['text-muted', 'canvas'],
        ['text-on-accent', 'brand-primary'],
        ['status-safe', 'status-safe-background'],
        ['status-warning', 'status-warning-background']
      ];
      for (const [foreground, background] of pairs) {
        expect(contrastRatio(roles[foreground], roles[background])).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('uses product-active semantics instead of success green in Forest Dark navigation', () => {
    const css = read('src/design-system/tokens.css');
    expect(css).toContain('--theme-navigation-active-background: rgba(195, 168, 239, 0.17)');
    expect(css).toContain('--theme-navigation-active-text: #e3d6f7');
    expect(css).not.toMatch(/\[data-theme='dark'\][\s\S]*?--theme-navigation-active-text:\s*#(?:10b981|287a4f)/i);
  });
});

describe('BIG-UPDATE-12 Library, route motion, and Settings contracts', () => {
  const library = read('src/routes/Library.jsx');
  const layout = read('src/layout/AppLayout.jsx');
  const settings = read('src/routes/Settings.jsx');
  const css = read('src/styles/global.css');

  it('uses calm main methods, inline SVG icons, and no emoji method cards', () => {
    expect(library).toContain("t('library.methodSample')");
    expect(library).toContain("t('library.methodPaste')");
    expect(library).toContain("t('library.methodFile')");
    expect(library).toContain('LibraryMethodIcon');
    expect(library).not.toMatch(/[⚡✍️📁🤖]/u);
    expect(library).not.toContain('Trợ lý Prompt');
  });

  it('retains import callbacks and moves technical/backup detail behind disclosures', () => {
    for (const callback of ['openFilePicker', 'openTextFilePicker', 'openDocumentFilePicker', 'loadDemoSampleQuickstart', 'confirmImport']) {
      expect(library).toContain(callback);
    }
    expect(library).toContain('libraryBackupDisclosure');
    expect(library).toContain('libraryTechnicalDisclosure');
    expect(library).toContain('<V2BackupRestorePanel');
  });

  it('animates only keyed route content with no delayed navigation', () => {
    expect(layout).toContain('className="routeStage"');
    expect(layout).toContain('key={location.pathname}');
    expect(layout).toContain('<Sidebar />');
    expect(layout).toContain('<BottomNav />');
    expect(layout).not.toMatch(/setTimeout|setInterval/);
    expect(css).toContain('@keyframes bu12-route-enter');
    expect(css).toMatch(/\.routeStage,[\s\S]*animation:\s*none !important/);
  });

  it('places normal preferences first and collapses advanced/developer groups', () => {
    expect(settings.indexOf('<ShimeLanguageSwitch />')).toBeLessThan(settings.indexOf('<FsrsExperimentalSettingsPanel />'));
    expect(settings).toContain("title={t('settings.advanced')}");
    expect(settings).toContain("title={t('settings.developer')}");
    expect(read('src/components/settings/SettingsDisclosure.jsx')).toContain('aria-expanded={open}');
    expect(read('src/components/settings/SettingsDisclosure.jsx')).toContain('hidden={!open}');
  });
});

describe('BIG-UPDATE-12 locked capabilities', () => {
  it('adds no forbidden runtime APIs or dependency packages', () => {
    const sources = [
      'src/uiI18n/localeRuntime.js', 'src/uiI18n/localeStorage.js',
      'src/uiTheme/themeRuntime.js', 'src/layout/AppLayout.jsx',
      'src/routes/Home.jsx', 'src/routes/Dashboard.jsx', 'src/routes/Library.jsx',
      'src/routes/Settings.jsx'
    ].map(read).join('\n');
    for (const term of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.bluetooth', 'navigator.serial', 'getUserMedia', 'MediaRecorder', 'Notification.requestPermission', 'serviceWorker.register']) {
      expect(sources).not.toContain(term);
    }
    const packageJson = JSON.parse(read('package.json'));
    for (const dependency of ['i18next', 'react-intl', 'formatjs', 'framer-motion', 'gsap', 'lottie', 'three']) {
      expect(packageJson.dependencies?.[dependency]).toBeUndefined();
      expect(packageJson.devDependencies?.[dependency]).toBeUndefined();
    }
  });
});

