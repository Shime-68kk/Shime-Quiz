/**
 * Phase 31C — Data Safety Center Prototype Unit Tests
 *
 * Test-only. Uses generated/fixture data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network.
 *
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
 * PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED,
  normalizeDataSafetyPrototypeConfig,
  shouldShowDataSafetyCenterPrototype,
  getDataSafetyCenterPrototypeViewModel,
} from '../../src/features/dataSafety/dataSafetyCenterPrototype.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

// Strip block and line comments from source before checking for forbidden API references.
// JSDoc headers document what the module does NOT use — those mentions should not fail the check.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
}

// ── Default-off flag ──────────────────────────────────────────────────────────

describe('DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED', () => {
  it('default flag is OFF (false)', () => {
    expect(DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED).toBe(false);
  });
});

// ── normalizeDataSafetyPrototypeConfig ────────────────────────────────────────

describe('normalizeDataSafetyPrototypeConfig', () => {
  it('returns disabled for undefined input', () => {
    const result = normalizeDataSafetyPrototypeConfig(undefined);
    expect(result.enabled).toBe(false);
  });

  it('returns disabled for null input', () => {
    const result = normalizeDataSafetyPrototypeConfig(null);
    expect(result.enabled).toBe(false);
  });

  it('returns disabled for empty object', () => {
    const result = normalizeDataSafetyPrototypeConfig({});
    expect(result.enabled).toBe(false);
  });

  it('returns disabled when enabled is false', () => {
    const result = normalizeDataSafetyPrototypeConfig({ enabled: false, mode: 'test' });
    expect(result.enabled).toBe(false);
  });

  it('returns enabled when enabled is true', () => {
    const result = normalizeDataSafetyPrototypeConfig({ enabled: true, mode: 'test' });
    expect(result.enabled).toBe(true);
  });

  it('returns default mode for missing mode', () => {
    const result = normalizeDataSafetyPrototypeConfig({ enabled: true });
    expect(result.mode).toBe('default');
  });

  it('preserves mode string when provided', () => {
    const result = normalizeDataSafetyPrototypeConfig({ enabled: true, mode: 'dev' });
    expect(result.mode).toBe('dev');
  });

  it('does not mutate the input object', () => {
    const input = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => normalizeDataSafetyPrototypeConfig(input)).not.toThrow();
    expect(input.enabled).toBe(true);
  });
});

// ── shouldShowDataSafetyCenterPrototype ───────────────────────────────────────

describe('shouldShowDataSafetyCenterPrototype', () => {
  it('returns false for undefined input (disabled/default-off)', () => {
    expect(shouldShowDataSafetyCenterPrototype(undefined)).toBe(false);
  });

  it('returns false for null input', () => {
    expect(shouldShowDataSafetyCenterPrototype(null)).toBe(false);
  });

  it('disabled config {} hides prototype (default production behavior)', () => {
    expect(shouldShowDataSafetyCenterPrototype({})).toBe(false);
  });

  it('returns false when enabled false', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: false, mode: 'test' })).toBe(false);
  });

  it('returns false when enabled true but mode is default', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true })).toBe(false);
  });

  it('returns false when enabled true but mode is production', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'production' })).toBe(false);
  });

  it('returns false when enabled true but mode is live', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'live' })).toBe(false);
  });

  it('returns false for empty string mode', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: '' })).toBe(false);
  });

  it('enabled config shows prototype in test mode', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'test' })).toBe(true);
  });

  it('enabled config shows prototype in dev mode', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'dev' })).toBe(true);
  });

  it('unknown/invalid config remains conservative (false)', () => {
    expect(shouldShowDataSafetyCenterPrototype('invalid')).toBe(false);
    expect(shouldShowDataSafetyCenterPrototype(42)).toBe(false);
    expect(shouldShowDataSafetyCenterPrototype(true)).toBe(false);
  });

  it('does not mutate input object', () => {
    const input = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => shouldShowDataSafetyCenterPrototype(input)).not.toThrow();
    expect(input.enabled).toBe(true);
  });
});

// ── getDataSafetyCenterPrototypeViewModel — structure ────────────────────────

describe('getDataSafetyCenterPrototypeViewModel — structure', () => {
  it('returns a view model object with source and sections', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(typeof vm).toBe('object');
    expect(vm.source).toBe('phase31c_prototype');
    expect(typeof vm.sections).toBe('object');
  });

  it('view model includes all required sections', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const { sections } = vm;
    expect(sections).toHaveProperty('readinessSummary');
    expect(sections).toHaveProperty('localDataExplanation');
    expect(sections).toHaveProperty('exportBackup');
    expect(sections).toHaveProperty('importPreview');
    expect(sections).toHaveProperty('restoreCaution');
    expect(sections).toHaveProperty('backupReminder');
    expect(sections).toHaveProperty('browserStorageLimit');
    expect(sections).toHaveProperty('evidenceGaps');
    expect(sections).toHaveProperty('helpFaq');
  });

  it('each section has a sectionId', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    for (const [key, section] of Object.entries(vm.sections)) {
      expect(typeof section.sectionId).toBe('string', `${key}.sectionId should be a string`);
      expect(section.sectionId.length).toBeGreaterThan(0, `${key}.sectionId should be non-empty`);
    }
  });

  it('each section has titleVi and bodyVi', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    for (const [key, section] of Object.entries(vm.sections)) {
      expect(typeof section.titleVi).toBe('string', `${key}.titleVi should be a string`);
      expect(section.titleVi.length).toBeGreaterThan(0, `${key}.titleVi should be non-empty`);
      expect(typeof section.bodyVi).toBe('string', `${key}.bodyVi should be a string`);
      expect(section.bodyVi.length).toBeGreaterThan(0, `${key}.bodyVi should be non-empty`);
    }
  });
});

// ── Copy boundaries: local-first and no-cloud/no-backend ─────────────────────

describe('getDataSafetyCenterPrototypeViewModel — copy boundaries', () => {
  it('copy includes local-first wording', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const serialized = JSON.stringify(vm).toLowerCase();
    expect(serialized).toContain('cục bộ');
  });

  it('copy includes no-cloud boundary', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const boundaries = vm.copyBoundaries;
    expect(boundaries.noCloudSync).toBe(true);
    expect(boundaries.noAccountRequired).toBe(true);
  });

  it('copy includes no-automatic-backup boundary', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noAutomaticBackup).toBe(true);
  });

  it('copy includes no-restore-safety-guarantee boundary', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noRestoreSafetyGuarantee).toBe(true);
  });

  it('copy includes no-production-readiness boundary', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noProductionReadinessClaim).toBe(true);
  });

  it('copy includes local data section wording for no account required', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.sections.localDataExplanation.noAccountRequired).toBe(true);
    expect(vm.sections.localDataExplanation.noCloudSync).toBe(true);
  });
});

// ── Forbidden claims: BETA_READY, production, safety guarantee ───────────────

describe('getDataSafetyCenterPrototypeViewModel — forbidden claims absent', () => {
  it('copy does not claim BETA_READY', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noBetaReadyClaim).toBe(true);
    // The evidenceGaps section should explicitly mention betaReadyNotApproved
    expect(vm.sections.evidenceGaps.betaReadyNotApproved).toBe(true);
  });

  it('copy does not contain cloud sync claim', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const bodyVi = vm.sections.localDataExplanation.bodyVi;
    // Body should mention "không có đồng bộ đám mây" (no cloud sync)
    expect(bodyVi.toLowerCase()).toContain('không có đồng bộ đám mây');
  });

  it('copy does not claim automatic backup', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const serialized = JSON.stringify(vm.sections.backupReminder).toLowerCase();
    expect(serialized).toContain('không có sao lưu tự động');
  });

  it('copyBoundaries.noRealBackupBehaviorClaim is true', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noRealBackupBehaviorClaim).toBe(true);
  });

  it('copyBoundaries.noTelemetryClaim is true', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noTelemetryClaim).toBe(true);
  });

  it('copyBoundaries.noAiOcrApiKeyByokClaim is true', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.copyBoundaries.noAiOcrApiKeyByokClaim).toBe(true);
  });
});

// ── Placeholder actions: inert/disabled ──────────────────────────────────────

describe('getDataSafetyCenterPrototypeViewModel — placeholder actions are inert', () => {
  it('exportBackup section is disabled and placeholder', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const s = vm.sections.exportBackup;
    expect(s.disabled).toBe(true);
    expect(s.placeholder).toBe(true);
    expect(s.inert).toBe(true);
  });

  it('importPreview section is disabled and placeholder', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const s = vm.sections.importPreview;
    expect(s.disabled).toBe(true);
    expect(s.placeholder).toBe(true);
    expect(s.inert).toBe(true);
  });

  it('exportBackup actionLabel indicates non-functional', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const label = vm.sections.exportBackup.actionLabelEn.toLowerCase();
    expect(label).toContain('placeholder');
  });

  it('importPreview actionLabel indicates non-functional', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    const label = vm.sections.importPreview.actionLabelEn.toLowerCase();
    expect(label).toContain('placeholder');
  });

  it('restoreCaution has no restore execution', () => {
    const vm = getDataSafetyCenterPrototypeViewModel();
    expect(vm.sections.restoreCaution.noRestoreExecution).toBe(true);
  });
});

// ── Static source analysis: no storage/network write APIs ────────────────────

describe('dataSafetyCenterPrototype.js — static source analysis', () => {
  const srcPath = resolve(PROJECT_ROOT, `src/features/dataSafety/dataSafetyCenterPrototype.js`);
  let source = '';

  it('source file exists', () => {
    expect(fs.existsSync(srcPath)).toBe(true);
    source = fs.readFileSync(srcPath, 'utf8');
    expect(source.length).toBeGreaterThan(0);
  });

  it('source does not reference localStorage', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/localStorage/);
  });

  it('source does not reference sessionStorage', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/sessionStorage/);
  });

  it('source does not reference indexedDB', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/[Ii]ndexed[Dd][Bb]/);
  });

  it('source does not reference fetch()', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/\bfetch\s*\(/);
  });

  it('source does not reference XMLHttpRequest', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/XMLHttpRequest/);
  });

  it('source does not reference WebSocket', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/WebSocket/);
  });

  it('source does not reference navigator.sendBeacon', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/navigator\.sendBeacon/);
  });

  it('source does not import backup/restore/storage/sync/cloud/backend modules', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    const importLines = source.split('\n').filter(l => /^\s*import\s/.test(l));
    for (const line of importLines) {
      expect(line).not.toMatch(/backup|restore|storage|sync|cloud|backend|account|auth/i);
    }
  });

  it('source contains DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED = false', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(source).toMatch(/DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED\s*=\s*false/);
  });

  it('source exports shouldShowDataSafetyCenterPrototype', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(source).toMatch(/export\s+function\s+shouldShowDataSafetyCenterPrototype/);
  });

  it('source exports getDataSafetyCenterPrototypeViewModel', () => {
    source = source || fs.readFileSync(srcPath, 'utf8');
    expect(source).toMatch(/export\s+function\s+getDataSafetyCenterPrototypeViewModel/);
  });
});

// ── Static source analysis: component imports ─────────────────────────────────

describe('DataSafetyCenterPrototype.jsx — static source analysis', () => {
  const cmpPath = resolve(PROJECT_ROOT, `src/features/dataSafety/DataSafetyCenterPrototype.jsx`);
  let source = '';

  it('component source file exists', () => {
    expect(fs.existsSync(cmpPath)).toBe(true);
    source = fs.readFileSync(cmpPath, 'utf8');
    expect(source.length).toBeGreaterThan(0);
  });

  it('component does not import backup/restore/storage/sync/cloud/backend/auth modules', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    const importLines = source.split('\n').filter(l => /^\s*import\s/.test(l));
    for (const line of importLines) {
      expect(line).not.toMatch(/backup|restore|storage|sync|cloud|backend|account|auth/i);
    }
  });

  it('component does not reference localStorage or IndexedDB', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/localStorage/);
    expect(stripComments(source)).not.toMatch(/[Ii]ndexed[Dd][Bb]/);
  });

  it('component does not reference fetch or XMLHttpRequest', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(stripComments(source)).not.toMatch(/\bfetch\s*\(/);
    expect(stripComments(source)).not.toMatch(/XMLHttpRequest/);
  });

  it('component includes dsc-readiness-summary section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-readiness-summary');
  });

  it('component includes dsc-local-data section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-local-data');
  });

  it('component includes dsc-export-backup section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-export-backup');
  });

  it('component includes dsc-import-preview section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-import-preview');
  });

  it('component includes dsc-restore-caution section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-restore-caution');
  });

  it('component includes dsc-backup-reminder section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-backup-reminder');
  });

  it('component includes dsc-browser-storage-limit section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-browser-storage-limit');
  });

  it('component includes dsc-evidence-gaps section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-evidence-gaps');
  });

  it('component includes dsc-help-faq section marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('dsc-help-faq');
  });

  it('action buttons are disabled with disabled attribute', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    // Both export and import buttons must have disabled prop
    const disabledButtons = (source.match(/disabled/g) || []).length;
    expect(disabledButtons).toBeGreaterThanOrEqual(2);
  });

  it('action buttons have placeholder class marker', () => {
    source = source || fs.readFileSync(cmpPath, 'utf8');
    expect(source).toContain('settingsPanel__actionBtn--placeholder');
  });
});

// ── Default-off mounting behavior via pure config ────────────────────────────

describe('default-off mounting behavior', () => {
  it('empty config {} produces false (default production behavior)', () => {
    expect(shouldShowDataSafetyCenterPrototype({})).toBe(false);
  });

  it('default-enabled constant is false so production mount always hides prototype', () => {
    const config = { enabled: DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED };
    expect(shouldShowDataSafetyCenterPrototype(config)).toBe(false);
  });

  it('test-only activation is possible with explicit enabled+mode', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'test' })).toBe(true);
  });

  it('dev-only activation is possible with explicit enabled+mode', () => {
    expect(shouldShowDataSafetyCenterPrototype({ enabled: true, mode: 'dev' })).toBe(true);
  });
});
