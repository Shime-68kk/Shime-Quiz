import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeLanguageSwitch from '../../src/uiI18n/ShimeLanguageSwitch.jsx';
import { ShimeLanguageProvider, normalizeLocale } from '../../src/uiI18n/ShimeLanguageProvider.jsx';
import { getUiString } from '../../src/uiI18n/shimeUiCopyProposal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const runtimeFiles = [
  'src/uiI18n/ShimeLanguageProvider.jsx',
  'src/uiI18n/useShimeLanguage.js',
  'src/uiI18n/ShimeLanguageSwitch.jsx',
  'src/uiI18n/shimeLanguageSwitchPreview.jsx'
];
const runtimeSource = runtimeFiles.map(file => fs.readFileSync(resolve(PROJECT_ROOT, file), 'utf8')).join('\n');
const settingsSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/routes/Settings.jsx'), 'utf8');

function renderSwitch(initialLocale) {
  return renderToStaticMarkup(
    <ShimeLanguageProvider initialLocale={initialLocale}>
      <ShimeLanguageSwitch />
    </ShimeLanguageProvider>
  );
}

describe('UI-I18N-1 visible language runtime', () => {
  it('renders Vietnamese by default', () => {
    const html = renderSwitch();
    expect(html).toContain('Ngôn ngữ');
    expect(html).toContain('Tiếng Việt');
    expect(html).toContain('English');
    expect(html).toContain('Tải lại trang sẽ quay về Tiếng Việt');
  });

  it('renders English preview when in-memory locale is English', () => {
    const html = renderSwitch('en');
    expect(html).toContain('Language');
    expect(html).toContain('Vietnamese');
    expect(html).toContain('English');
    expect(html).toContain('Reloading the page resets to Vietnamese');
  });

  it('wires visible switch buttons to in-memory Vietnamese and English locales', () => {
    expect(runtimeSource).toContain('onClick={() => setLocale(SHIME_LOCALES.VI)}');
    expect(runtimeSource).toContain('onClick={() => setLocale(SHIME_LOCALES.EN)}');
  });

  it('falls back unknown locales to Vietnamese', () => {
    expect(normalizeLocale('fr')).toBe('vi');
    expect(getUiString('settingsLanguage', 'unknown')).toBe('Ngôn ngữ hiển thị');
    expect(renderSwitch('fr')).toContain('Ngôn ngữ');
  });

  it('is mounted in Settings and not in StudyRoom or DeviceBridge runtime', () => {
    expect(settingsSource).toContain("import { ShimeLanguageProvider } from '../uiI18n/ShimeLanguageProvider.jsx';");
    expect(settingsSource).toContain("import ShimeLanguageSwitch from '../uiI18n/ShimeLanguageSwitch.jsx';");
    expect(settingsSource).toContain('<ShimeLanguageSwitch />');
    expect(runtimeSource).not.toContain('StudyRoom');
    expect(runtimeSource).not.toMatch(/from ['"].*deviceBridge/);
    expect(runtimeSource).not.toMatch(/from ['"].*DeviceBridge/);
  });

  it('does not use persistence, browser language detection, network, AI, or robot-send APIs', () => {
    [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'navigator.language',
      'navigator.languages',
      'fetch(',
      'XMLHttpRequest',
      'WebSocket',
      'navigator.bluetooth',
      'navigator.serial',
      'OPENAI',
      'ANTHROPIC',
      'GEMINI',
      'API_KEY',
      'emitStudyEvent',
      'sendRobotCommand'
    ].forEach(term => {
      expect(runtimeSource).not.toContain(term);
    });
  });
});
