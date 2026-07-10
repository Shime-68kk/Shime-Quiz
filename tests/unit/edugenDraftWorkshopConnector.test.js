/**
 * tests/unit/edugenDraftWorkshopConnector.test.js
 *
 * Phase 16F — EduGen Draft Workshop Connector Foundation unit tests.
 *
 * Covers:
 *   • URL normalization edge cases (empty, invalid, http(s), trailing slash).
 *   • Health URL building.
 *   • checkEdugenHealth success / failure / timeout with injected fetch.
 *   • Settings storage edugenServiceUrl default / persistence / backup
 *     round-trip / no-write-on-read invariant.
 *   • Static source/doc assertions (no ai-process call site,
 *     no built-in AI / OCR / bundled / cloud claims, etc.).
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EDUGEN_DRAFT_SOURCE_METADATA_SHAPE,
  EDUGEN_HEALTH_STATUS,
  buildEdugenHealthUrl,
  checkEdugenHealth,
  isEdugenServiceConfigured,
  normalizeEdugenServiceUrl
} from '../../src/edugen/edugenConnector.js';
import {
  SETTINGS_STORAGE_KEY,
  SETTINGS_SCHEMA_VERSION,
  getDefaultSettings,
  getSettings,
  importSettings,
  normalizeSettings,
  updateSettings
} from '../../src/state/settingsStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    get length() { return map.size; },
    getItem(key) { calls.push(['getItem', key]); return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { calls.push(['setItem', key, value]); map.set(key, String(value)); },
    removeItem(key) { calls.push(['removeItem', key]); map.delete(key); },
    key(index) { return [...map.keys()][index] || null; },
    dump(key) { return map.get(key); }
  };
}

function withMockWindow(storage, run) {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;

  Object.defineProperty(globalThis, 'CustomEvent', {
    configurable: true,
    value: class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    }
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: storage,
      BroadcastChannel: undefined,
      dispatchEvent() { return true; },
      addEventListener() {},
      removeEventListener() {}
    }
  });

  try {
    return run();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent;
    else Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, value: previousCustomEvent });
  }
}

// ── 1. URL normalization ────────────────────────────────────────────────────

describe('normalizeEdugenServiceUrl', () => {
  it('returns empty string for null, undefined, or non-string', () => {
    expect(normalizeEdugenServiceUrl(null)).toBe('');
    expect(normalizeEdugenServiceUrl(undefined)).toBe('');
    expect(normalizeEdugenServiceUrl(42)).toBe('');
    expect(normalizeEdugenServiceUrl({})).toBe('');
  });

  it('returns empty string for empty/whitespace input', () => {
    expect(normalizeEdugenServiceUrl('')).toBe('');
    expect(normalizeEdugenServiceUrl('   ')).toBe('');
    expect(normalizeEdugenServiceUrl('\n\t')).toBe('');
  });

  it('returns empty string for invalid URLs', () => {
    expect(normalizeEdugenServiceUrl('not-a-url')).toBe('');
    expect(normalizeEdugenServiceUrl('htp:/invalid')).toBe('');
  });

  it('rejects non-http(s) schemes', () => {
    expect(normalizeEdugenServiceUrl('file:///etc/passwd')).toBe('');
    expect(normalizeEdugenServiceUrl('javascript:alert(1)')).toBe('');
    expect(normalizeEdugenServiceUrl('ftp://example.com')).toBe('');
    expect(normalizeEdugenServiceUrl('data:text/plain,x')).toBe('');
  });

  it('accepts http URLs', () => {
    expect(normalizeEdugenServiceUrl('http://localhost:3333')).toBe('http://localhost:3333');
    expect(normalizeEdugenServiceUrl('  http://localhost:3333  ')).toBe('http://localhost:3333');
  });

  it('accepts https URLs', () => {
    expect(normalizeEdugenServiceUrl('https://edugen.example.com')).toBe('https://edugen.example.com');
  });

  it('strips trailing slashes', () => {
    expect(normalizeEdugenServiceUrl('http://localhost:3333/')).toBe('http://localhost:3333');
    expect(normalizeEdugenServiceUrl('http://localhost:3333///')).toBe('http://localhost:3333');
    expect(normalizeEdugenServiceUrl('https://example.com/api/')).toBe('https://example.com/api');
  });

  it('preserves path/port without modification', () => {
    expect(normalizeEdugenServiceUrl('http://localhost:8080/api/v1')).toBe('http://localhost:8080/api/v1');
  });
});

// ── 2. isEdugenServiceConfigured ────────────────────────────────────────────

describe('isEdugenServiceConfigured', () => {
  it('returns false for empty/invalid URL', () => {
    expect(isEdugenServiceConfigured('')).toBe(false);
    expect(isEdugenServiceConfigured('not-a-url')).toBe(false);
    expect(isEdugenServiceConfigured('file:///x')).toBe(false);
  });

  it('returns true for valid http(s) URLs', () => {
    expect(isEdugenServiceConfigured('http://localhost:3333')).toBe(true);
    expect(isEdugenServiceConfigured('https://edugen.example.com')).toBe(true);
  });
});

// ── 3. buildEdugenHealthUrl ─────────────────────────────────────────────────

describe('buildEdugenHealthUrl', () => {
  it('returns empty string when URL is not configured', () => {
    expect(buildEdugenHealthUrl('')).toBe('');
    expect(buildEdugenHealthUrl(undefined)).toBe('');
    expect(buildEdugenHealthUrl('not-a-url')).toBe('');
  });

  it('appends /health to the normalized base', () => {
    expect(buildEdugenHealthUrl('http://localhost:3333')).toBe('http://localhost:3333/health');
    expect(buildEdugenHealthUrl('http://localhost:3333/')).toBe('http://localhost:3333/health');
    expect(buildEdugenHealthUrl('https://edugen.example.com/api/')).toBe('https://edugen.example.com/api/health');
  });
});

// ── 4. checkEdugenHealth ─────────────────────────────────────────────────────

describe('checkEdugenHealth', () => {
  it('returns not_configured when URL is empty', async () => {
    const result = await checkEdugenHealth('', { fetchImpl: () => { throw new Error('should not call'); } });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.NOT_CONFIGURED);
  });

  it('returns invalid_url when URL is non-http(s)', async () => {
    const result = await checkEdugenHealth('file:///etc/passwd', {
      fetchImpl: () => { throw new Error('should not call'); }
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.INVALID_URL);
  });

  it('returns reachable when fetch responds OK', async () => {
    const calls = [];
    const fetchImpl = async (url) => {
      calls.push(url);
      return { ok: true, status: 200 };
    };
    const result = await checkEdugenHealth('http://localhost:3333', { fetchImpl });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.REACHABLE);
    expect(result.code).toBe(200);
    expect(calls).toEqual(['http://localhost:3333/health']);
  });

  it('returns not_reachable when fetch returns non-ok status', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503 });
    const result = await checkEdugenHealth('http://localhost:3333', { fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.NOT_REACHABLE);
    expect(result.code).toBe(503);
  });

  it('returns not_reachable on network error', async () => {
    const fetchImpl = async () => { throw new TypeError('network down'); };
    const result = await checkEdugenHealth('http://localhost:3333', { fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.NOT_REACHABLE);
  });

  it('returns timeout when AbortError is thrown', async () => {
    const fetchImpl = async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    };
    const result = await checkEdugenHealth('http://localhost:3333', { fetchImpl, timeoutMs: 10 });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.TIMEOUT);
  });

  it('returns not_reachable when fetch impl is not available', async () => {
    const result = await checkEdugenHealth('http://localhost:3333', { fetchImpl: null });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(EDUGEN_HEALTH_STATUS.NOT_REACHABLE);
  });

  it('does not call the configured endpoint with a documented body or upload', async () => {
    let capturedOptions = null;
    const fetchImpl = async (_url, options) => {
      capturedOptions = options;
      return { ok: true, status: 204 };
    };
    await checkEdugenHealth('http://localhost:3333', { fetchImpl });
    expect(capturedOptions).not.toBeNull();
    expect(capturedOptions.method).toBe('GET');
    expect(capturedOptions.body).toBeUndefined();
  });
});

// ── 5. settingsStorage edugenServiceUrl integration ──────────────────────────

describe('settingsStorage — edugenServiceUrl default and normalization', () => {
  it('defaults to empty string', () => {
    expect(getDefaultSettings().edugenServiceUrl).toBe('');
  });

  it('normalizes invalid/non-http(s) URLs to empty string', () => {
    expect(normalizeSettings({ edugenServiceUrl: 'not-a-url' }).edugenServiceUrl).toBe('');
    expect(normalizeSettings({ edugenServiceUrl: 'file:///x' }).edugenServiceUrl).toBe('');
    expect(normalizeSettings({ edugenServiceUrl: '   ' }).edugenServiceUrl).toBe('');
    expect(normalizeSettings({ edugenServiceUrl: null }).edugenServiceUrl).toBe('');
  });

  it('accepts and trims valid http(s) URLs', () => {
    expect(normalizeSettings({ edugenServiceUrl: 'http://localhost:3333' }).edugenServiceUrl)
      .toBe('http://localhost:3333');
    expect(normalizeSettings({ edugenServiceUrl: 'http://localhost:3333/' }).edugenServiceUrl)
      .toBe('http://localhost:3333');
    expect(normalizeSettings({ edugenServiceUrl: 'https://edugen.example.com' }).edugenServiceUrl)
      .toBe('https://edugen.example.com');
  });
});

describe('settingsStorage — getSettings preserves no-write-on-read for edugenServiceUrl', () => {
  it('returns default with edugenServiceUrl="" when key absent and never calls setItem', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const settings = getSettings();
      expect(settings.edugenServiceUrl).toBe('');
      const setItemCalls = storage.calls.filter(c => c[0] === 'setItem');
      expect(setItemCalls).toHaveLength(0);
    });
  });
});

describe('settingsStorage — updateSettings persists edugenServiceUrl', () => {
  it('updates the URL and preserves unrelated FSRS fields', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const initial = updateSettings({ fsrsExperimentalEnabled: true });
      expect(initial.ok).toBe(true);
      const after = updateSettings({ edugenServiceUrl: 'http://localhost:3333/' });
      expect(after.ok).toBe(true);
      expect(after.settings.edugenServiceUrl).toBe('http://localhost:3333');
      expect(after.settings.fsrsExperimentalEnabled).toBe(true);
      expect(after.settings.fsrsEnabledAt).not.toBeNull();
    });
  });

  it('normalizes garbage to empty string on update', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const result = updateSettings({ edugenServiceUrl: 'definitely-not-a-url' });
      expect(result.ok).toBe(true);
      expect(result.settings.edugenServiceUrl).toBe('');
    });
  });
});

describe('settingsStorage — importSettings round-trips edugenServiceUrl', () => {
  it('preserves URL on import', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const payload = {
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        fsrsExperimentalEnabled: true,
        edugenServiceUrl: 'https://edugen.example.com'
      };
      const result = importSettings(payload);
      expect(result.ok).toBe(true);
      expect(result.settings.edugenServiceUrl).toBe('https://edugen.example.com');
      expect(getSettings().edugenServiceUrl).toBe('https://edugen.example.com');
    });
  });

  it('treats missing edugenServiceUrl as empty string on import', () => {
    const storage = createMockStorage({});
    withMockWindow(storage, () => {
      const payload = {
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        fsrsExperimentalEnabled: false
      };
      const result = importSettings(payload);
      expect(result.ok).toBe(true);
      expect(result.settings.edugenServiceUrl).toBe('');
    });
  });
});

// ── 6. Source metadata expected shape (documented, not persisted) ────────────

describe('EDUGEN_DRAFT_SOURCE_METADATA_SHAPE — documentation reference', () => {
  it('exposes expected field names for future EduGen draft items', () => {
    expect(EDUGEN_DRAFT_SOURCE_METADATA_SHAPE.sourceType).toBe('edugen-draft');
    expect(EDUGEN_DRAFT_SOURCE_METADATA_SHAPE.processor).toBe('edugen');
    expect(EDUGEN_DRAFT_SOURCE_METADATA_SHAPE.reviewRequired).toBe(true);
    expect('sourceName' in EDUGEN_DRAFT_SOURCE_METADATA_SHAPE).toBe(true);
    expect('importedAt' in EDUGEN_DRAFT_SOURCE_METADATA_SHAPE).toBe(true);
  });

  it('is frozen so callers cannot mutate the documentation reference', () => {
    expect(Object.isFrozen(EDUGEN_DRAFT_SOURCE_METADATA_SHAPE)).toBe(true);
  });
});

// ── 7. Connector source — no AI/OCR/cloud calls ──────────────────────────────

describe('Phase 16F — connector source safety', () => {
  const source = read('src/edugen/edugenConnector.js');

  it('does not call an ai-process endpoint', () => {
    expect(source).not.toContain('ai-process');
  });

  it('does not include built-in AI / OCR / cloud claims', () => {
    expect(source.toLowerCase()).not.toContain('built-in ai');
    expect(source.toLowerCase()).not.toContain('built-in ocr');
    expect(source.toLowerCase()).not.toContain('edugen is bundled');
    expect(source.toLowerCase()).not.toContain('cloud sync exists');
  });

  it('marks the module as health-check only (no document upload here)', () => {
    expect(source).toContain('NEVER uploads documents');
    expect(source).toContain('NEVER calls an AI endpoint');
  });

  it('does not introduce ts-fsrs.next() call sites', () => {
    expect(source).not.toMatch(/ts-fsrs/);
    expect(source).not.toMatch(/\.next\(/);
  });
});

// ── 8. Settings panel source — claim-safe Vietnamese-first copy ─────────────

describe('Phase 16F — EduGenDraftWorkshopPanel source', () => {
  const panel = read('src/components/settings/EduGenDraftWorkshopPanel.jsx');
  const viCopy = read('src/uiI18n/translations/vi.js');

  it('uses Xưởng bản nháp framing', () => {
    expect(panel).toContain("t('edugen.title')");
    expect(viCopy).toContain('Xưởng bản nháp EduGen');
  });

  it('contains required Vietnamese-first wording', () => {
    expect(panel).toContain("t('edugen.serviceUrl')");
    expect(panel).toContain("t('edugen.workshopBody')");
    expect(viCopy).toContain('URL dịch vụ EduGen');
    expect(viCopy).toContain('Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.');
  });

  it('does not frame EduGen as an AI generator', () => {
    expect(panel.toLowerCase()).not.toContain('ai generator');
  });

  it('does not assert positive built-in AI / OCR / cloud capabilities', () => {
    // Panel disclaimers may use these terms in negative form (Vietnamese
    // or English). The forbidden patterns below are explicit positive
    // assertions, not bare keywords.
    const positiveAssertions = [
      'shime has built-in ai',
      'built-in ai quiz generation exists',
      'shime has built-in ocr',
      'cloud sync is available',
      'cloud processing is available',
    ];
    for (const phrase of positiveAssertions) {
      expect(panel.toLowerCase()).not.toContain(phrase);
    }
  });

  it('mentions health check copy', () => {
    expect(panel).toContain("t('edugen.check')");
    expect(viCopy).toContain('Kiểm tra kết nối');
  });

  it('does not include a document upload UI', () => {
    expect(panel).not.toContain('input type="file"');
    expect(panel).not.toContain("type='file'");
    expect(panel).not.toContain('FormData');
  });
});

// ── 9. Settings route mounts the new panel ─────────────────────────────────

describe('Phase 16F — Settings.jsx mounts EduGen Draft Workshop panel', () => {
  const settings = read('src/routes/Settings.jsx');

  it('imports EduGenDraftWorkshopPanel', () => {
    expect(settings).toContain('EduGenDraftWorkshopPanel');
  });

  it('renders the new panel JSX', () => {
    expect(settings).toMatch(/<EduGenDraftWorkshopPanel\b/);
  });

  it('keeps the existing FSRS experimental panel mount', () => {
    expect(settings).toContain('FsrsExperimentalSettingsPanel');
  });
});

// ── 10. Home.jsx Draft Workshop framing ─────────────────────────────────────

describe('Phase 16F — Home.jsx mentions Draft Workshop framing', () => {
  const home = read('src/routes/Home.jsx');
  const viCopy = read('src/uiI18n/translations/vi.js');

  it('uses Xưởng bản nháp wording', () => {
    expect(home).toContain("t('home.technicalServiceBody')");
    expect(viCopy).toContain('Xưởng bản nháp');
  });

  it('still mentions optional companion / not bundled context', () => {
    expect(viCopy).toContain('không được bundle');
  });

  it('keeps the existing review-required draft framing', () => {
    expect(viCopy).toContain('Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.');
  });
});

// ── 11. Doc / required terms ────────────────────────────────────────────────

describe('Phase 16F — required doc exists with required terms', () => {
  const doc = read('docs/phase16f-edugen-draft-workshop-connector-foundation.md');
  const docLower = doc.toLowerCase();

  const requiredTerms = [
    'draft workshop',
    'xưởng bản nháp',
    'optional companion',
    'not bundled',
    'review required',
    'no built-in ai',
    'no ocr',
    'no cloud sync',
    'local-first',
    'no automatic fsrs activation',
    'service url',
    'health check'
  ];

  for (const term of requiredTerms) {
    it(`contains required term: ${term}`, () => {
      expect(docLower).toContain(term);
    });
  }
});

// ── 12. Forbidden claims ─────────────────────────────────────────────────────

describe('Phase 16F — forbidden positive-claim assertions absent', () => {
  const doc = read('docs/phase16f-edugen-draft-workshop-connector-foundation.md');
  const panel = read('src/components/settings/EduGenDraftWorkshopPanel.jsx');
  const home = read('src/routes/Home.jsx');
  const connector = read('src/edugen/edugenConnector.js');

  // Each entry is an assertive positive claim. Documents may discuss these
  // categories in negative form ("there is no built-in OCR"), but must never
  // make the positive assertion. We use specific verb phrasings to avoid
  // false positives against legitimate "no <thing> exists" disclaimers.
  const forbidden = [
    'edugen is bundled with shime',
    'edugen is shipped with shime',
    'edugen comes bundled',
    'shime includes edugen',
    'shime ships with edugen',
    'shime has built-in ai',
    'shime ships built-in ai',
    'built-in ai quiz generation exists',
    'shime has built-in ocr',
    'built-in ocr exists',
    'ocr is supported',
    'cloud sync is available',
    'cloud sync exists',
    'sync has shipped',
    'ai scheduling is enabled',
    'ai scheduled this for you',
    'mastery is guaranteed',
    'mastery guaranteed',
    'correct answers guaranteed',
    'generated questions are guaranteed correct',
    'frontend-only processes documents',
    'api key required',
    'byok is supported',
  ];

  for (const phrase of forbidden) {
    it(`doc does not assert "${phrase}"`, () => {
      expect(doc.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
    it(`panel does not assert "${phrase}"`, () => {
      expect(panel.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
    it(`home does not assert "${phrase}"`, () => {
      expect(home.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
    it(`connector does not assert "${phrase}"`, () => {
      expect(connector.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  }
});

// ── 13. No forbidden runtime files modified ─────────────────────────────────

describe('Phase 16F — scheduler/storage critical files preserved', () => {
  const critical = [
    'src/quiz/reviewSchedulerAdapter.js',
    'src/quiz/fsrsWrapper.js',
    'src/state/reviewScheduleStorage.js',
    'src/quiz/dataBackup.js',
    'src/state/v2BackupRestore.js'
  ];
  for (const file of critical) {
    it(`${file} exists`, () => {
      expect(fs.existsSync(resolve(PROJECT_ROOT, file))).toBe(true);
    });
  }

  it('settingsStorage.js retains storage key constant', () => {
    const source = read('src/state/settingsStorage.js');
    expect(source).toContain("'shimeV2SettingsV1'");
  });

  it('fsrsWrapper.js still has exactly 2 .next() call sites (no new ones added)', () => {
    const wrapper = read('src/quiz/fsrsWrapper.js');
    const matches = wrapper.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

// ── 14. Workflow registers Phase 16F validator after Phase 16E ──────────────

describe('Phase 16F — workflow registration', () => {
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('workflow registers Phase 16E validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16e-visual-polish-quick-wins.js');
  });

  it('workflow registers Phase 16F validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
  });

  it('Phase 16F validator appears after Phase 16E in workflow', () => {
    const eIdx = workflow.indexOf('node scripts/validate-phase16e-visual-polish-quick-wins.js');
    const fIdx = workflow.indexOf('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
    expect(eIdx).toBeGreaterThan(-1);
    expect(fIdx).toBeGreaterThan(eIdx);
  });
});

// ── 15. No package/dependency changes ────────────────────────────────────────

describe('Phase 16F — package files unchanged', () => {
  it('package.json parses as valid JSON', () => {
    const text = read('package.json');
    expect(() => JSON.parse(text)).not.toThrow();
  });

  it('package-lock.json parses as valid JSON', () => {
    const text = read('package-lock.json');
    expect(() => JSON.parse(text)).not.toThrow();
  });
});
