/**
 * tests/unit/storageLargeImportEdugenRiskAudit.test.js
 *
 * Phase 16C — Storage / Large Import Safety / EduGen Bulk Import Risk Audit.
 *
 * Pure static/doc-oriented assertions: no jsdom, no DOM rendering.
 * Each check confirms that the Phase 16C audit doc is complete and correct,
 * that no forbidden runtime files were introduced, and that no forbidden
 * patterns appear in src/.
 */

import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(resolve(PROJECT_ROOT, relativePath));
}

function readDir(relativePath) {
  const full = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true });
}

// ── 1. Phase 16C doc presence and required sections ────────────────────────

describe('Phase 16C — doc exists with required sections', () => {
  const DOC_PATH = 'docs/phase16c-storage-large-import-edugen-risk-audit.md';

  it('Phase 16C doc exists', () => {
    expect(exists(DOC_PATH)).toBe(true);
  });

  it('doc contains storage surface inventory section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/storage surface inventory/i);
  });

  it('doc contains canonical data section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/canonical data/i);
  });

  it('doc contains derived data section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/derived data/i);
  });

  it('doc contains large import risk section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/large import risk/i);
  });

  it('doc contains EduGen bulk import risk section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/EduGen bulk import risk/i);
  });

  it('doc contains draft review requirement for EduGen output', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/draft/i);
    expect(doc).toMatch(/review/i);
  });

  it('doc mentions sourceMetadata requirement', () => {
    const doc = read(DOC_PATH);
    expect(doc).toContain('sourceMetadata');
  });

  it('doc contains backup/export/import section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/backup\/export\/import/i);
  });

  it('doc contains FSRS metadata section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/FSRS metadata/i);
  });

  it('doc references schedulerKind field', () => {
    const doc = read(DOC_PATH);
    expect(doc).toContain('schedulerKind');
  });

  it('doc references fsrsPayload field', () => {
    const doc = read(DOC_PATH);
    expect(doc).toContain('fsrsPayload');
  });

  it('doc references fsrsReviewLogs field', () => {
    const doc = read(DOC_PATH);
    expect(doc).toContain('fsrsReviewLogs');
  });

  it('doc contains IndexedDB migration prerequisites section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/IndexedDB migration prerequisites/i);
  });

  it('doc contains event log prerequisites section', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/event log prerequisites/i);
  });

  it('doc states docs/tests/validator/CI only', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/docs\/tests\/validator\/CI only/i);
  });

  it('doc states no runtime changes', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/no runtime changes/i);
  });

  it('doc states no IndexedDB migration', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/no IndexedDB migration/i);
  });

  it('doc states no EduGen connector runtime', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/no EduGen connector runtime/i);
  });

  it('doc states backup/export/import remains primary', () => {
    const doc = read(DOC_PATH);
    expect(doc).toMatch(/backup\/export\/import is the primary portability model|backup remains primary portability|primary portability/i);
  });
});

// ── 2. Phase 16C doc forbids built-in AI/OCR/cloud claims ─────────────────

describe('Phase 16C — doc forbids built-in AI/OCR/cloud claims', () => {
  const DOC_PATH = 'docs/phase16c-storage-large-import-edugen-risk-audit.md';

  const FORBIDDEN_POSITIVE_CLAIMS = [
    'EduGen is bundled',
    'built-in AI quiz generation exists',
    'built-in OCR exists',
    'cloud sync exists',
    'sync is available',
    'IndexedDB migration has been completed',
    'event log has been implemented',
    'generated questions are guaranteed correct',
    'active FSRS public rollout has occurred',
  ];

  for (const claim of FORBIDDEN_POSITIVE_CLAIMS) {
    it(`doc does not contain forbidden positive claim: "${claim}"`, () => {
      const doc = read(DOC_PATH).toLowerCase();
      expect(doc).not.toContain(claim.toLowerCase());
    });
  }
});

// ── 3. No src/ files changed in Phase 16C ─────────────────────────────────

describe('Phase 16C — no src/ files changed', () => {
  const SRC_FILES_TO_CHECK = [
    'src/state/reviewScheduleStorage.js',
    'src/state/settingsStorage.js',
    'src/state/v2BackupRestore.js',
    'src/quiz/dataBackup.js',
    'src/quiz/reviewSchedulerAdapter.js',
    'src/quiz/fsrsWrapper.js',
    'src/routes/Dashboard.jsx',
    'src/routes/StudyRoom.jsx',
  ];

  it('src/ directory exists', () => {
    expect(exists('src')).toBe(true);
  });

  for (const file of SRC_FILES_TO_CHECK) {
    it(`${file} exists (not removed by Phase 16C)`, () => {
      expect(exists(file)).toBe(true);
    });
  }

  it('fsrsWrapper.js preserves exactly 2 .next() call sites (Phase 15B regression guard)', () => {
    const source = read('src/quiz/fsrsWrapper.js');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('reviewSchedulerAdapter.js preserves fsrsExperimentalEnabled double-gate', () => {
    const source = read('src/quiz/reviewSchedulerAdapter.js');
    expect(source).toContain('fsrsExperimentalEnabled');
  });

  it('reviewSchedulerAdapter.js preserves fsrsActiveSchedulingEnabled double-gate', () => {
    const source = read('src/quiz/reviewSchedulerAdapter.js');
    expect(source).toContain('fsrsActiveSchedulingEnabled');
  });
});

// ── 4. No package files changed ────────────────────────────────────────────

describe('Phase 16C — no package files changed', () => {
  it('package.json exists', () => {
    expect(exists('package.json')).toBe(true);
  });

  it('package-lock.json exists', () => {
    expect(exists('package-lock.json')).toBe(true);
  });

  it('package.json does not include IndexedDB adapter dependency', () => {
    const pkg = JSON.parse(read('package.json'));
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };
    const FORBIDDEN_DEPS = ['idb', 'idb-keyval', 'localforage', 'dexie'];
    for (const dep of FORBIDDEN_DEPS) {
      expect(allDeps[dep]).toBeUndefined();
    }
  });

  it('package.json does not include sync/cloud/EduGen connector dependency', () => {
    const pkg = JSON.parse(read('package.json'));
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };
    const FORBIDDEN_DEPS = ['firebase', 'supabase', '@supabase/supabase-js', 'pouchdb', 'rxdb'];
    for (const dep of FORBIDDEN_DEPS) {
      expect(allDeps[dep]).toBeUndefined();
    }
  });
});

// ── 5. No e2e/ files changed ───────────────────────────────────────────────

describe('Phase 16C — no new e2e files added', () => {
  it('e2e/ directory exists', () => {
    expect(exists('e2e')).toBe(true);
  });

  it('no Phase 16C-specific e2e file exists', () => {
    const E2E_FORBIDDEN = [
      'e2e/phase16c-storage-import.spec.js',
      'e2e/storageLargeImport.spec.js',
      'e2e/edugenmBulkImport.spec.js',
    ];
    for (const file of E2E_FORBIDDEN) {
      expect(exists(file)).toBe(false);
    }
  });
});

// ── 6. No new IndexedDB runtime use in src/ ────────────────────────────────

describe('Phase 16C — no new IndexedDB runtime in src/', () => {
  it('src/ does not contain openIndexedDB or indexedDB.open calls', () => {
    const SRC_DIR = resolve(PROJECT_ROOT, 'src');
    const violations = [];

    function scanDir(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const full = resolve(dirPath, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          const content = fs.readFileSync(full, 'utf8');
          if (/indexedDB\.open\s*\(|openIDB\s*\(|new\s+IDBFactory/i.test(content)) {
            violations.push(full.replace(PROJECT_ROOT + '/', ''));
          }
        }
      }
    }

    if (fs.existsSync(SRC_DIR)) scanDir(SRC_DIR);
    expect(violations).toEqual([]);
  });
});

// ── 7. No new StorageAdapter or SyncAdapter runtime file ──────────────────

describe('Phase 16C — no forbidden runtime files exist', () => {
  const FORBIDDEN_RUNTIME_FILES = [
    'src/storage/StorageAdapter.js',
    'src/storage/LocalStorageAdapter.js',
    'src/storage/IndexedDBAdapter.js',
    'src/storage/SyncAdapter.js',
    'src/storage/EventLog.js',
    'src/sync/SyncAdapter.js',
    'src/sync/EventLog.js',
  ];

  for (const file of FORBIDDEN_RUNTIME_FILES) {
    it(`${file} does not exist`, () => {
      expect(exists(file)).toBe(false);
    });
  }
});

// ── 8. No new ts-fsrs.next() call sites beyond existing wrapper ────────────

describe('Phase 16C — no new ts-fsrs.next() call sites beyond approved wrapper', () => {
  it('fsrsWrapper.js has exactly 2 .next() calls (approved call sites)', () => {
    const source = read('src/quiz/fsrsWrapper.js');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('reviewSchedulerAdapter.js does not call .next() directly', () => {
    const source = read('src/quiz/reviewSchedulerAdapter.js');
    const directNextCalls = source.match(/\.next\s*\(/g) ?? [];
    expect(directNextCalls.length).toBe(0);
  });

  it('no other src/ file calls .next() in a FSRS context', () => {
    const SRC_DIR = resolve(PROJECT_ROOT, 'src');
    const APPROVED_WRAPPER = resolve(PROJECT_ROOT, 'src/quiz/fsrsWrapper.js');
    const violations = [];

    function scanDir(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const full = resolve(dirPath, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          if (full === APPROVED_WRAPPER) continue;
          const content = fs.readFileSync(full, 'utf8');
          if (/fsrs.*\.next\s*\(|\.next\s*\(\s*card/i.test(content)) {
            violations.push(full.replace(PROJECT_ROOT + '/', ''));
          }
        }
      }
    }

    if (fs.existsSync(SRC_DIR)) scanDir(SRC_DIR);
    expect(violations).toEqual([]);
  });
});

// ── 9. Phase 16C validator and doc are present ─────────────────────────────

describe('Phase 16C — phase artifacts are present', () => {
  it('Phase 16C doc exists', () => {
    expect(exists('docs/phase16c-storage-large-import-edugen-risk-audit.md')).toBe(true);
  });

  it('Phase 16C validator exists', () => {
    expect(exists('scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js')).toBe(true);
  });

  it('Phase 16C validator is registered in CI workflow after Phase 16B', () => {
    const workflow = read('.github/workflows/e2e-smoke.yml');
    const phase16bPos = workflow.indexOf('validate-phase16b-hybrid-local-first-optional-sync-direction.js');
    const phase16cPos = workflow.indexOf('validate-phase16c-storage-large-import-edugen-risk-audit.js');
    expect(phase16bPos).toBeGreaterThan(-1);
    expect(phase16cPos).toBeGreaterThan(phase16bPos);
  });
});
