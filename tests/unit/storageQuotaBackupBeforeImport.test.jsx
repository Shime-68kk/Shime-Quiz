/**
 * tests/unit/storageQuotaBackupBeforeImport.test.jsx
 *
 * Phase 16K — Storage Quota & Backup-Before-Import Runtime Hardening.
 *
 * Static source inspection tests for BackupBeforeImportNotice component.
 * Verifies copy, large-import detection, and no import-semantic changes.
 * Pattern: static source checks consistent with prior phases.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Expected file not found: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(resolve(PROJECT_ROOT, relativePath));
}

// ── 1. Phase 16K required files exist ────────────────────────────────────────

describe('Phase 16K — required files exist', () => {
  it('Phase 16K doc exists', () => {
    expect(exists('docs/phase16k-storage-quota-backup-before-import-hardening.md')).toBe(true);
  });

  it('Phase 16K validator exists', () => {
    expect(exists('scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js')).toBe(true);
  });

  it('BackupBeforeImportNotice component exists', () => {
    expect(exists('src/components/learning/BackupBeforeImportNotice.jsx')).toBe(true);
  });

  it('storageQuotaEstimate utility exists', () => {
    expect(exists('src/utils/storageQuotaEstimate.js')).toBe(true);
  });
});

// ── 2. BackupBeforeImportNotice component copy checks ────────────────────────

describe('Phase 16K — BackupBeforeImportNotice component copy', () => {
  const COMPONENT_PATH = 'src/components/learning/BackupBeforeImportNotice.jsx';

  it('includes Vietnamese backup-oriented copy (sao lưu)', () => {
    const source = read(COMPONENT_PATH);
    expect(source.toLowerCase()).toContain('sao lưu');
  });

  it('mentions local storage (cục bộ)', () => {
    const source = read(COMPONENT_PATH);
    expect(source.toLowerCase()).toContain('cục bộ');
  });

  it('references LARGE_IMPORT_ITEM_THRESHOLD from utility', () => {
    const source = read(COMPONENT_PATH);
    expect(source).toContain('LARGE_IMPORT_ITEM_THRESHOLD');
  });

  it('references import count in output copy', () => {
    const source = read(COMPONENT_PATH);
    expect(source).toContain('itemCount');
  });

  it('does not import cloud/sync/auth modules', () => {
    const source = read(COMPONENT_PATH);
    expect(source).not.toMatch(/from.*auth|from.*cloud|from.*sync/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest/i);
  });

  it('includes EduGen draft review reminder', () => {
    const source = read(COMPONENT_PATH);
    const lower = source.toLowerCase();
    expect(lower).toMatch(/bản nháp|draft/i);
    expect(lower).toMatch(/xem lại|review/i);
  });

  it('does not contain disabled import button logic', () => {
    const source = read(COMPONENT_PATH);
    expect(source).not.toMatch(/disabled.*import|blocked.*import/i);
  });
});

// ── 3. Library.jsx uses BackupBeforeImportNotice ──────────────────────────────

describe('Phase 16K — Library.jsx integration', () => {
  const LIBRARY_PATH = 'src/routes/Library.jsx';

  it('Library.jsx imports BackupBeforeImportNotice', () => {
    const source = read(LIBRARY_PATH);
    expect(source).toContain('BackupBeforeImportNotice');
  });

  it('Library.jsx renders BackupBeforeImportNotice in import preview area', () => {
    const source = read(LIBRARY_PATH);
    expect(source).toMatch(/<BackupBeforeImportNotice/);
  });

  it('Library.jsx does not call cloud/sync APIs', () => {
    const source = read(LIBRARY_PATH);
    expect(source).not.toMatch(/fetch\s*\(\s*['"]https?:\/\//i);
    expect(source).not.toMatch(/XMLHttpRequest/i);
  });
});

// ── 4. storageQuotaEstimate utility — Phase 16K exports ──────────────────────

describe('Phase 16K — storageQuotaEstimate utility exports', () => {
  const UTIL_PATH = 'src/utils/storageQuotaEstimate.js';

  it('exports LARGE_IMPORT_ITEM_THRESHOLD', () => {
    const source = read(UTIL_PATH);
    expect(source).toContain('export const LARGE_IMPORT_ITEM_THRESHOLD');
  });

  it('exports getLargeImportItemCountWarning', () => {
    const source = read(UTIL_PATH);
    expect(source).toContain('export function getLargeImportItemCountWarning');
  });

  it('getLargeImportItemCountWarning handles invalid input defensively', () => {
    const source = read(UTIL_PATH);
    expect(source).toMatch(/isLarge:\s*false/);
  });

  it('preserves existing navigator.storage.estimate logic', () => {
    const source = read(UTIL_PATH);
    expect(source).toContain('navigator.storage');
    expect(source).toContain('estimate');
  });
});

// ── 5. Phase 16K scope — no forbidden changes ─────────────────────────────────

describe('Phase 16K — no forbidden runtime changes', () => {
  const FORBIDDEN_FILES = [
    'src/quiz/reviewSchedulerAdapter.js',
    'src/quiz/fsrsWrapper.js',
    'src/state/reviewScheduleStorage.js',
    'src/state/settingsStorage.js',
  ];

  for (const file of FORBIDDEN_FILES) {
    it(`${file} exists (not removed by Phase 16K)`, () => {
      expect(exists(file)).toBe(true);
    });
  }

  it('no IndexedDB runtime introduced in src/', () => {
    function scanDir(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const full = resolve(PROJECT_ROOT, dirPath, entry.name);
        if (entry.isDirectory()) scanDir(`${dirPath}/${entry.name}`);
        else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          const content = fs.readFileSync(full, 'utf8');
          if (/indexedDB\.open\s*\(|openIDB\s*\(|new\s+IDBFactory/i.test(content)) {
            throw new Error(`IndexedDB runtime found in: ${full}`);
          }
        }
      }
    }
    expect(() => scanDir('src')).not.toThrow();
  });

  it('fsrsWrapper.js preserves exactly 2 .next() call sites', () => {
    const source = read('src/quiz/fsrsWrapper.js');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('package.json does not contain forbidden IndexedDB/sync dependencies', () => {
    const pkg = JSON.parse(read('package.json'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const dep of ['idb', 'idb-keyval', 'localforage', 'dexie', 'firebase', 'supabase']) {
      expect(allDeps[dep]).toBeUndefined();
    }
  });
});
