/**
 * Phase 27C — Test-Only No-Write Adapter-Awareness Model Unit Tests
 *
 * PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL
 * PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION
 * PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM
 *
 * Test-only. Uses generated/synthetic data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network, no telemetry.
 * No backup/export/restore calls. No Date.now.
 * canClaimProductionSafety is always false in Phase 27C.
 * Evidence: unit_static_only or generated_test_rehearsal_only.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeAdapterAwarenessInput,
  deriveAdapterAwarenessState,
  createAdapterCompatibilityWarning,
  summarizeAdapterAwarenessForBackupHealth,
  ADAPTER_AWARENESS_STATE,
  ADAPTER_COMPATIBILITY_SEVERITY,
  ADAPTER_AWARENESS_EVIDENCE_LEVEL,
} from '../../src/state/adapterAwarenessModel.js';

// ── 1. Exports exist ──────────────────────────────────────────────────────────

describe('exports', () => {
  it('normalizeAdapterAwarenessInput is a function', () => {
    expect(typeof normalizeAdapterAwarenessInput).toBe('function');
  });

  it('deriveAdapterAwarenessState is a function', () => {
    expect(typeof deriveAdapterAwarenessState).toBe('function');
  });

  it('createAdapterCompatibilityWarning is a function', () => {
    expect(typeof createAdapterCompatibilityWarning).toBe('function');
  });

  it('summarizeAdapterAwarenessForBackupHealth is a function', () => {
    expect(typeof summarizeAdapterAwarenessForBackupHealth).toBe('function');
  });

  it('ADAPTER_AWARENESS_STATE constants are exported', () => {
    expect(typeof ADAPTER_AWARENESS_STATE).toBe('object');
    expect(ADAPTER_AWARENESS_STATE).not.toBeNull();
  });

  it('ADAPTER_COMPATIBILITY_SEVERITY constants are exported', () => {
    expect(typeof ADAPTER_COMPATIBILITY_SEVERITY).toBe('object');
    expect(ADAPTER_COMPATIBILITY_SEVERITY).not.toBeNull();
  });

  it('ADAPTER_AWARENESS_EVIDENCE_LEVEL constants are exported', () => {
    expect(typeof ADAPTER_AWARENESS_EVIDENCE_LEVEL).toBe('object');
    expect(ADAPTER_AWARENESS_EVIDENCE_LEVEL).not.toBeNull();
  });
});

// ── 2. State ID constants ─────────────────────────────────────────────────────

describe('ADAPTER_AWARENESS_STATE contains all required state IDs', () => {
  it('adapter_status_unavailable', () => {
    expect(ADAPTER_AWARENESS_STATE.ADAPTER_STATUS_UNAVAILABLE).toBe('adapter_status_unavailable');
  });

  it('restore_rehearsal_verified_generated_data', () => {
    expect(ADAPTER_AWARENESS_STATE.RESTORE_REHEARSAL_VERIFIED_GENERATED_DATA).toBe(
      'restore_rehearsal_verified_generated_data'
    );
  });

  it('missing_source_adapter', () => {
    expect(ADAPTER_AWARENESS_STATE.MISSING_SOURCE_ADAPTER).toBe('missing_source_adapter');
  });

  it('missing_target_adapter', () => {
    expect(ADAPTER_AWARENESS_STATE.MISSING_TARGET_ADAPTER).toBe('missing_target_adapter');
  });

  it('different_adapter_context', () => {
    expect(ADAPTER_AWARENESS_STATE.DIFFERENT_ADAPTER_CONTEXT).toBe('different_adapter_context');
  });

  it('same_adapter_context', () => {
    expect(ADAPTER_AWARENESS_STATE.SAME_ADAPTER_CONTEXT).toBe('same_adapter_context');
  });

  it('unknown_adapter_state', () => {
    expect(ADAPTER_AWARENESS_STATE.UNKNOWN_ADAPTER_STATE).toBe('unknown_adapter_state');
  });
});

// ── 3. normalizeAdapterAwarenessInput — null/undefined/non-object tolerance ───

describe('normalizeAdapterAwarenessInput — null/undefined/non-object input', () => {
  it('returns object for null input', () => {
    const result = normalizeAdapterAwarenessInput(null);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for undefined input', () => {
    const result = normalizeAdapterAwarenessInput(undefined);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for string input', () => {
    const result = normalizeAdapterAwarenessInput('not-an-object');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for number input', () => {
    const result = normalizeAdapterAwarenessInput(42);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for array input', () => {
    const result = normalizeAdapterAwarenessInput(['a', 'b']);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns empty object for empty object input', () => {
    const result = normalizeAdapterAwarenessInput({});
    expect(result).toEqual({});
  });
});

// ── 4. normalizeAdapterAwarenessInput — input immutability ───────────────────

describe('normalizeAdapterAwarenessInput — input immutability', () => {
  it('does not mutate input object', () => {
    const input = { sourceAdapterId: '  localstorage  ', targetAdapterId: 'indexeddb' };
    const frozen = Object.freeze({ ...input });
    const result = normalizeAdapterAwarenessInput(frozen);
    expect(result).not.toBe(frozen);
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('returns a new object, not the same reference', () => {
    const input = { sourceAdapterId: 'localstorage' };
    const result = normalizeAdapterAwarenessInput(input);
    expect(result).not.toBe(input);
  });
});

// ── 5. normalizeAdapterAwarenessInput — string trimming ──────────────────────

describe('normalizeAdapterAwarenessInput — string trimming', () => {
  it('trims sourceAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({ sourceAdapterId: '  localstorage  ' });
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('trims targetAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({ targetAdapterId: '\tindexeddb\n' });
    expect(result.targetAdapterId).toBe('indexeddb');
  });

  it('trims adapterKind', () => {
    const result = normalizeAdapterAwarenessInput({ adapterKind: '  local  ' });
    expect(result.adapterKind).toBe('local');
  });
});

// ── 6. normalizeAdapterAwarenessInput — empty string normalization ────────────

describe('normalizeAdapterAwarenessInput — empty string normalization', () => {
  it('normalizes empty sourceAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessInput({ sourceAdapterId: '' });
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('normalizes whitespace-only sourceAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessInput({ sourceAdapterId: '   ' });
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('normalizes empty targetAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessInput({ targetAdapterId: '' });
    expect(result.targetAdapterId).toBeUndefined();
  });

  it('normalizes empty adapterKind to undefined', () => {
    const result = normalizeAdapterAwarenessInput({ adapterKind: '' });
    expect(result.adapterKind).toBeUndefined();
  });
});

// ── 7. normalizeAdapterAwarenessInput — alias handling ───────────────────────

describe('normalizeAdapterAwarenessInput — alias handling', () => {
  it('resolves exportAdapterId as alias for sourceAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({ exportAdapterId: 'localstorage' });
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('resolves restoreAdapterId as alias for targetAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({ restoreAdapterId: 'indexeddb' });
    expect(result.targetAdapterId).toBe('indexeddb');
  });

  it('canonical sourceAdapterId takes precedence over exportAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({
      sourceAdapterId: 'localstorage',
      exportAdapterId: 'other',
    });
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('canonical targetAdapterId takes precedence over restoreAdapterId', () => {
    const result = normalizeAdapterAwarenessInput({
      targetAdapterId: 'indexeddb',
      restoreAdapterId: 'other',
    });
    expect(result.targetAdapterId).toBe('indexeddb');
  });

  it('adapterId fallback used when sourceAdapterId and exportAdapterId are absent', () => {
    const result = normalizeAdapterAwarenessInput({ adapterId: 'localstorage' });
    expect(result.sourceAdapterId).toBe('localstorage');
    expect(result.targetAdapterId).toBe('localstorage');
  });

  it('canonical sourceAdapterId takes precedence over adapterId fallback', () => {
    const result = normalizeAdapterAwarenessInput({
      sourceAdapterId: 'canonical',
      adapterId: 'fallback',
    });
    expect(result.sourceAdapterId).toBe('canonical');
  });
});

// ── 8. deriveAdapterAwarenessState — all required state IDs produced ──────────

describe('deriveAdapterAwarenessState — all required state IDs', () => {
  it('returns adapter_status_unavailable when adapterStatusUnavailable is true', () => {
    const state = deriveAdapterAwarenessState({ adapterStatusUnavailable: true });
    expect(state).toBe('adapter_status_unavailable');
  });

  it('returns restore_rehearsal_verified_generated_data when both flags are true', () => {
    const state = deriveAdapterAwarenessState({
      restoreRehearsalVerified: true,
      generatedTestData: true,
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(state).toBe('restore_rehearsal_verified_generated_data');
  });

  it('returns missing_source_adapter when sourceAdapterId is absent', () => {
    const state = deriveAdapterAwarenessState({ targetAdapterId: 'indexeddb' });
    expect(state).toBe('missing_source_adapter');
  });

  it('returns missing_target_adapter when targetAdapterId is absent', () => {
    const state = deriveAdapterAwarenessState({ sourceAdapterId: 'localstorage' });
    expect(state).toBe('missing_target_adapter');
  });

  it('returns different_adapter_context when adapters differ', () => {
    const state = deriveAdapterAwarenessState({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'indexeddb',
    });
    expect(state).toBe('different_adapter_context');
  });

  it('returns same_adapter_context when adapters match', () => {
    const state = deriveAdapterAwarenessState({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(state).toBe('same_adapter_context');
  });
});

// ── 9. deriveAdapterAwarenessState — conservative priority order ──────────────

describe('deriveAdapterAwarenessState — conservative priority order', () => {
  it('adapter_status_unavailable beats all other states', () => {
    const state = deriveAdapterAwarenessState({
      adapterStatusUnavailable: true,
      restoreRehearsalVerified: true,
      generatedTestData: true,
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(state).toBe('adapter_status_unavailable');
  });

  it('restore_rehearsal_verified_generated_data beats missing_source_adapter', () => {
    const state = deriveAdapterAwarenessState({
      restoreRehearsalVerified: true,
      generatedTestData: true,
    });
    expect(state).toBe('restore_rehearsal_verified_generated_data');
  });

  it('missing_source_adapter beats missing_target_adapter (source checked first)', () => {
    const state = deriveAdapterAwarenessState({});
    expect(state).toBe('missing_source_adapter');
  });

  it('missing_target_adapter when source present but target absent', () => {
    const state = deriveAdapterAwarenessState({ sourceAdapterId: 'localstorage' });
    expect(state).toBe('missing_target_adapter');
  });

  it('different_adapter_context when both present but different', () => {
    const state = deriveAdapterAwarenessState({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'indexeddb',
    });
    expect(state).toBe('different_adapter_context');
  });

  it('same_adapter_context only when both present and identical', () => {
    const state = deriveAdapterAwarenessState({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(state).toBe('same_adapter_context');
  });

  it('restore_rehearsal_verified_generated_data requires both restoreRehearsalVerified AND generatedTestData', () => {
    const stateA = deriveAdapterAwarenessState({
      restoreRehearsalVerified: true,
      generatedTestData: false,
    });
    expect(stateA).not.toBe('restore_rehearsal_verified_generated_data');

    const stateB = deriveAdapterAwarenessState({
      restoreRehearsalVerified: false,
      generatedTestData: true,
    });
    expect(stateB).not.toBe('restore_rehearsal_verified_generated_data');
  });
});

// ── 10. deriveAdapterAwarenessState — null/undefined/non-object tolerance ─────

describe('deriveAdapterAwarenessState — null/undefined/non-object tolerance', () => {
  it('returns a string for null input', () => {
    expect(typeof deriveAdapterAwarenessState(null)).toBe('string');
  });

  it('returns a string for undefined input', () => {
    expect(typeof deriveAdapterAwarenessState(undefined)).toBe('string');
  });

  it('returns a string for non-object input', () => {
    expect(typeof deriveAdapterAwarenessState('not-an-object')).toBe('string');
  });

  it('returns a known state ID for null input', () => {
    const state = deriveAdapterAwarenessState(null);
    const knownStates = Object.values(ADAPTER_AWARENESS_STATE);
    expect(knownStates).toContain(state);
  });
});

// ── 11. createAdapterCompatibilityWarning — warning object shape ──────────────

describe('createAdapterCompatibilityWarning — warning object shape', () => {
  it('returns an object with stateId, severity, messageVi, claimBoundary', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    expect(typeof warning.stateId).toBe('string');
    expect(typeof warning.severity).toBe('string');
    expect(typeof warning.messageVi).toBe('string');
    expect(typeof warning.claimBoundary).toBe('string');
  });

  it('returns a known severity value', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    const knownSeverities = Object.values(ADAPTER_COMPATIBILITY_SEVERITY);
    expect(knownSeverities).toContain(warning.severity);
  });

  it('returns a known state ID', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    const knownStates = Object.values(ADAPTER_AWARENESS_STATE);
    expect(knownStates).toContain(warning.stateId);
  });

  it('returns messageVi as non-empty string', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    expect(warning.messageVi.length).toBeGreaterThan(0);
  });

  it('warning for unavailable state has severity unavailable', () => {
    const warning = createAdapterCompatibilityWarning({ adapterStatusUnavailable: true });
    expect(warning.severity).toBe('unavailable');
  });

  it('warning for same adapter context has severity info', () => {
    const warning = createAdapterCompatibilityWarning({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(warning.severity).toBe('info');
  });

  it('warning for different adapter context has severity caution', () => {
    const warning = createAdapterCompatibilityWarning({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'indexeddb',
    });
    expect(warning.severity).toBe('caution');
  });

  it('warning for missing source adapter has severity caution', () => {
    const warning = createAdapterCompatibilityWarning({ targetAdapterId: 'indexeddb' });
    expect(warning.severity).toBe('caution');
  });

  it('warning for missing target adapter has severity caution', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'localstorage' });
    expect(warning.severity).toBe('caution');
  });
});

// ── 12. summarizeAdapterAwarenessForBackupHealth — summary object shape ───────

describe('summarizeAdapterAwarenessForBackupHealth — summary object shape', () => {
  it('returns an object with all required fields', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({
      sourceAdapterId: 'ls',
      targetAdapterId: 'ls',
    });
    expect(typeof summary.stateId).toBe('string');
    expect(typeof summary.severity).toBe('string');
    expect(typeof summary.labelVi).toBe('string');
    expect(typeof summary.detailVi).toBe('string');
    expect(typeof summary.canClaimProductionSafety).toBe('boolean');
    expect(typeof summary.evidenceLevel).toBe('string');
  });

  it('returns a known state ID', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    const knownStates = Object.values(ADAPTER_AWARENESS_STATE);
    expect(knownStates).toContain(summary.stateId);
  });

  it('returns a known severity', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    const knownSeverities = Object.values(ADAPTER_COMPATIBILITY_SEVERITY);
    expect(knownSeverities).toContain(summary.severity);
  });

  it('returns a known evidence level', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    const knownLevels = Object.values(ADAPTER_AWARENESS_EVIDENCE_LEVEL);
    expect(knownLevels).toContain(summary.evidenceLevel);
  });
});

// ── 13. canClaimProductionSafety is always false ──────────────────────────────

describe('canClaimProductionSafety is always false in Phase 27C', () => {
  const testCases = [
    { label: 'null input', input: null },
    { label: 'undefined input', input: undefined },
    { label: 'empty object', input: {} },
    { label: 'unavailable state', input: { adapterStatusUnavailable: true } },
    {
      label: 'restore_rehearsal_verified_generated_data',
      input: { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
    },
    { label: 'missing source', input: { targetAdapterId: 'indexeddb' } },
    { label: 'missing target', input: { sourceAdapterId: 'localstorage' } },
    { label: 'different adapters', input: { sourceAdapterId: 'localstorage', targetAdapterId: 'indexeddb' } },
    { label: 'same adapters', input: { sourceAdapterId: 'localstorage', targetAdapterId: 'localstorage' } },
  ];

  for (const tc of testCases) {
    it(`canClaimProductionSafety is false for: ${tc.label}`, () => {
      const summary = summarizeAdapterAwarenessForBackupHealth(tc.input);
      expect(summary.canClaimProductionSafety).toBe(false);
    });
  }
});

// ── 14. Evidence levels ───────────────────────────────────────────────────────

describe('evidence levels', () => {
  it('evidenceLevel is generated_test_rehearsal_only when restoreRehearsalVerified and generatedTestData are true', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({
      restoreRehearsalVerified: true,
      generatedTestData: true,
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(summary.evidenceLevel).toBe('generated_test_rehearsal_only');
  });

  it('evidenceLevel is unit_static_only for same_adapter_context without rehearsal flags', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(summary.evidenceLevel).toBe('unit_static_only');
  });

  it('evidenceLevel is unit_static_only for different_adapter_context', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'indexeddb',
    });
    expect(summary.evidenceLevel).toBe('unit_static_only');
  });

  it('evidenceLevel is unknown for unavailable state', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ adapterStatusUnavailable: true });
    expect(summary.evidenceLevel).toBe('unknown');
  });

  it('evidenceLevel is one of the allowed values in all cases', () => {
    const inputs = [
      null,
      undefined,
      {},
      { adapterStatusUnavailable: true },
      { restoreRehearsalVerified: true, generatedTestData: true },
      { sourceAdapterId: 'ls' },
      { targetAdapterId: 'ls' },
      { sourceAdapterId: 'ls', targetAdapterId: 'idb' },
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
    ];
    const knownLevels = Object.values(ADAPTER_AWARENESS_EVIDENCE_LEVEL);
    for (const input of inputs) {
      const summary = summarizeAdapterAwarenessForBackupHealth(input);
      expect(knownLevels).toContain(summary.evidenceLevel);
    }
  });
});

// ── 15. Vietnamese-first copy presence ───────────────────────────────────────

describe('Vietnamese-first copy presence', () => {
  it('messageVi contains Vietnamese characters in warning', () => {
    const warning = createAdapterCompatibilityWarning({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    // Vietnamese uses diacritical marks, check for at least one known Vietnamese word
    expect(warning.messageVi).toMatch(/[àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
  });

  it('labelVi contains non-empty string in summary', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    expect(summary.labelVi.length).toBeGreaterThan(0);
  });

  it('detailVi contains non-empty string in summary', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    expect(summary.detailVi.length).toBeGreaterThan(0);
  });

  it('detailVi contains Vietnamese characters in summary', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({ sourceAdapterId: 'ls', targetAdapterId: 'ls' });
    expect(summary.detailVi).toMatch(/[àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
  });
});

// ── 16. Forbidden claim strings absent ───────────────────────────────────────

describe('forbidden claim strings absent from model outputs', () => {
  const FORBIDDEN_CLAIM_PATTERNS = [
    /guaranteed compatibility/i,
    /guaranteed data.loss prevention/i,
    /automatic backup/i,
    /platform backup preservation/i,
    /cloud.account recovery/i,
    /production adapter.aware backup/i,
    /BETA_READY/,
  ];

  function getAllOutputStrings(input) {
    const warning = createAdapterCompatibilityWarning(input);
    const summary = summarizeAdapterAwarenessForBackupHealth(input);
    return [
      warning.messageVi,
      warning.claimBoundary,
      summary.labelVi,
      summary.detailVi,
    ].join(' ');
  }

  const testInputs = [
    null,
    {},
    { adapterStatusUnavailable: true },
    { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
    { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
    { sourceAdapterId: 'ls', targetAdapterId: 'idb' },
    { sourceAdapterId: 'ls' },
    { targetAdapterId: 'idb' },
  ];

  for (const pattern of FORBIDDEN_CLAIM_PATTERNS) {
    it(`outputs do not contain "${pattern}"`, () => {
      for (const input of testInputs) {
        const allStrings = getAllOutputStrings(input);
        expect(allStrings).not.toMatch(pattern);
      }
    });
  }
});

// ── 17. No storage/write/network/telemetry APIs in source (static check) ──────

function readSourceNonCommentLines() {
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(
    path.resolve(process.cwd(), 'src/state/adapterAwarenessModel.js'),
    'utf8'
  );
  return raw
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return !t.startsWith('*') && !t.startsWith('//');
    })
    .join('\n');
}

describe('no forbidden APIs in source (static string check)', () => {
  it('source file does not use localStorage', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\blocalStorage\b/);
  });

  it('source file does not use indexedDB', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\bindexedDB\b/);
  });

  it('source file does not use fetch', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\bfetch\(/);
  });

  it('source file does not use XMLHttpRequest', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\bXMLHttpRequest\b/);
  });

  it('source file does not use sendBeacon', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\bsendBeacon\b/);
  });

  it('source file does not use Date.now', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/\bDate\.now\b/);
  });

  it('source file does not use telemetry or analytics', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/telemetry/i);
    expect(src).not.toMatch(/analytics/i);
  });
});

// ── 18. No backup/export/restore imports in source (static check) ─────────────

describe('no backup/export/restore imports in source (static check)', () => {
  it('source file does not import backup/export/restore modules', () => {
    const src = readSourceNonCommentLines();
    expect(src).not.toMatch(/import.*v2BackupRestore/);
    expect(src).not.toMatch(/import.*backup/i);
    expect(src).not.toMatch(/import.*restore/i);
  });
});

// ── 19. Generated/test data only boundary ─────────────────────────────────────

describe('generated/test data only boundary', () => {
  it('restore_rehearsal_verified_generated_data state does not imply production restore safety', () => {
    const warning = createAdapterCompatibilityWarning({
      restoreRehearsalVerified: true,
      generatedTestData: true,
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(warning.stateId).toBe('restore_rehearsal_verified_generated_data');
    expect(warning.messageVi).not.toMatch(/an toàn sản xuất được đảm bảo/i);
    expect(warning.claimBoundary).toMatch(/GENERATED_TEST_REHEARSAL_ONLY/);
  });

  it('summary for restore rehearsal has canClaimProductionSafety false', () => {
    const summary = summarizeAdapterAwarenessForBackupHealth({
      restoreRehearsalVerified: true,
      generatedTestData: true,
      sourceAdapterId: 'localstorage',
      targetAdapterId: 'localstorage',
    });
    expect(summary.canClaimProductionSafety).toBe(false);
    expect(summary.evidenceLevel).toBe('generated_test_rehearsal_only');
  });
});

// ── 20. All state IDs produce valid outputs from all three functions ───────────

describe('all state IDs produce valid outputs', () => {
  const STATE_INPUTS = [
    { label: 'adapter_status_unavailable', input: { adapterStatusUnavailable: true } },
    {
      label: 'restore_rehearsal_verified_generated_data',
      input: { restoreRehearsalVerified: true, generatedTestData: true },
    },
    { label: 'missing_source_adapter', input: { targetAdapterId: 'idb' } },
    { label: 'missing_target_adapter', input: { sourceAdapterId: 'ls' } },
    { label: 'different_adapter_context', input: { sourceAdapterId: 'ls', targetAdapterId: 'idb' } },
    { label: 'same_adapter_context', input: { sourceAdapterId: 'ls', targetAdapterId: 'ls' } },
  ];

  for (const tc of STATE_INPUTS) {
    it(`${tc.label} — deriveAdapterAwarenessState returns expected state`, () => {
      const state = deriveAdapterAwarenessState(tc.input);
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    it(`${tc.label} — createAdapterCompatibilityWarning returns valid shape`, () => {
      const warning = createAdapterCompatibilityWarning(tc.input);
      expect(typeof warning.stateId).toBe('string');
      expect(typeof warning.severity).toBe('string');
      expect(typeof warning.messageVi).toBe('string');
      expect(typeof warning.claimBoundary).toBe('string');
    });

    it(`${tc.label} — summarizeAdapterAwarenessForBackupHealth has canClaimProductionSafety false`, () => {
      const summary = summarizeAdapterAwarenessForBackupHealth(tc.input);
      expect(summary.canClaimProductionSafety).toBe(false);
    });
  }
});
