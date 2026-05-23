/**
 * Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype Unit Tests
 *
 * PHASE27E_THIN_READ_ONLY_INTEGRATION_STATUS: IMPLEMENTED_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE
 * PHASE27E_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27E_INTEGRATION_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_PRODUCTION_INTEGRATION
 * PHASE27E_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM
 *
 * Test-only. Uses generated/synthetic data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network, no telemetry.
 * No backup/export/restore calls. No Date.now.
 * canClaimProductionSafety is always false in Phase 27E.
 * Evidence: unit_static_only or generated_test_rehearsal_only.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeAdapterAwarenessSignalInput,
  createAdapterAwarenessSignal,
  deriveAdapterAwarenessFromSignals,
  summarizeAdapterAwarenessIntegration,
  ADAPTER_INTEGRATION_DISABLED_STATE,
} from '../../src/state/adapterAwarenessIntegrationPrototype.js';

const TEST_OPTS = { enabled: true, mode: 'test' };
const DEFAULT_OFF_OPTS = { enabled: true, mode: 'default-off' };

// ── 1. Exports exist ──────────────────────────────────────────────────────────

describe('exports', () => {
  it('normalizeAdapterAwarenessSignalInput is a function', () => {
    expect(typeof normalizeAdapterAwarenessSignalInput).toBe('function');
  });

  it('createAdapterAwarenessSignal is a function', () => {
    expect(typeof createAdapterAwarenessSignal).toBe('function');
  });

  it('deriveAdapterAwarenessFromSignals is a function', () => {
    expect(typeof deriveAdapterAwarenessFromSignals).toBe('function');
  });

  it('summarizeAdapterAwarenessIntegration is a function', () => {
    expect(typeof summarizeAdapterAwarenessIntegration).toBe('function');
  });

  it('ADAPTER_INTEGRATION_DISABLED_STATE is adapter_integration_disabled', () => {
    expect(ADAPTER_INTEGRATION_DISABLED_STATE).toBe('adapter_integration_disabled');
  });
});

// ── 2. Default-off without options ────────────────────────────────────────────

describe('default-off without options', () => {
  it('normalizeAdapterAwarenessSignalInput: integrationEnabled false with no options', () => {
    const result = normalizeAdapterAwarenessSignalInput({}, undefined);
    expect(result.integrationEnabled).toBe(false);
    expect(result.integrationMode).toBe('disabled');
  });

  it('createAdapterAwarenessSignal: stateId is adapter_integration_disabled with no options', () => {
    const result = createAdapterAwarenessSignal({}, undefined);
    expect(result.stateId).toBe('adapter_integration_disabled');
    expect(result.integrationEnabled).toBe(false);
  });

  it('deriveAdapterAwarenessFromSignals: returns adapter_integration_disabled with no options', () => {
    const result = deriveAdapterAwarenessFromSignals({}, undefined);
    expect(result).toBe('adapter_integration_disabled');
  });

  it('summarizeAdapterAwarenessIntegration: stateId is adapter_integration_disabled with no options', () => {
    const result = summarizeAdapterAwarenessIntegration({}, undefined);
    expect(result.stateId).toBe('adapter_integration_disabled');
    expect(result.integrationEnabled).toBe(false);
  });

  it('createAdapterAwarenessSignal: stateId is adapter_integration_disabled with null options', () => {
    const result = createAdapterAwarenessSignal({}, null);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });

  it('createAdapterAwarenessSignal: stateId is adapter_integration_disabled with empty object options', () => {
    const result = createAdapterAwarenessSignal({}, {});
    expect(result.stateId).toBe('adapter_integration_disabled');
  });
});

// ── 3. enabled: false disables ───────────────────────────────────────────────

describe('enabled: false disables integration', () => {
  it('createAdapterAwarenessSignal: disabled when enabled: false', () => {
    const result = createAdapterAwarenessSignal({}, { enabled: false, mode: 'test' });
    expect(result.integrationEnabled).toBe(false);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });

  it('deriveAdapterAwarenessFromSignals: returns disabled when enabled: false', () => {
    const result = deriveAdapterAwarenessFromSignals({}, { enabled: false, mode: 'test' });
    expect(result).toBe('adapter_integration_disabled');
  });

  it('summarizeAdapterAwarenessIntegration: disabled when enabled: false', () => {
    const result = summarizeAdapterAwarenessIntegration({}, { enabled: false, mode: 'test' });
    expect(result.integrationEnabled).toBe(false);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });
});

// ── 4. Only test and default-off modes enable ─────────────────────────────────

describe('only test and default-off modes enable', () => {
  it('mode test enables integration', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.integrationEnabled).toBe(true);
    expect(result.integrationMode).toBe('test');
  });

  it('mode default-off enables integration', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      DEFAULT_OFF_OPTS
    );
    expect(result.integrationEnabled).toBe(true);
    expect(result.integrationMode).toBe('default-off');
  });

  it('deriveAdapterAwarenessFromSignals enabled with mode test', () => {
    const result = deriveAdapterAwarenessFromSignals(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result).not.toBe('adapter_integration_disabled');
  });

  it('deriveAdapterAwarenessFromSignals enabled with mode default-off', () => {
    const result = deriveAdapterAwarenessFromSignals(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      DEFAULT_OFF_OPTS
    );
    expect(result).not.toBe('adapter_integration_disabled');
  });

  it('summarizeAdapterAwarenessIntegration integrationMode is test', () => {
    const result = summarizeAdapterAwarenessIntegration(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.integrationMode).toBe('test');
  });

  it('summarizeAdapterAwarenessIntegration integrationMode is default-off', () => {
    const result = summarizeAdapterAwarenessIntegration(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      DEFAULT_OFF_OPTS
    );
    expect(result.integrationMode).toBe('default-off');
  });
});

// ── 5. production/live/staging/beta/unknown modes rejected ────────────────────

describe('production/live/staging/beta/unknown modes rejected', () => {
  const rejectedModes = ['production', 'live', 'staging', 'beta', 'unknown', '', 'PRODUCTION'];

  for (const mode of rejectedModes) {
    it(`mode "${mode}" is rejected (disabled)`, () => {
      const result = createAdapterAwarenessSignal(
        { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
        { enabled: true, mode }
      );
      expect(result.integrationEnabled).toBe(false);
      expect(result.stateId).toBe('adapter_integration_disabled');
    });
  }

  it('no mode field is rejected', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      { enabled: true }
    );
    expect(result.integrationEnabled).toBe(false);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });
});

// ── 6. null/undefined/non-object input tolerance ──────────────────────────────

describe('null/undefined/non-object input tolerance', () => {
  const inputs = [null, undefined, 'string', 42, [], true];

  for (const input of inputs) {
    it(`createAdapterAwarenessSignal handles input: ${JSON.stringify(input)}`, () => {
      const result = createAdapterAwarenessSignal(input, TEST_OPTS);
      expect(typeof result.stateId).toBe('string');
      expect(typeof result.severity).toBe('string');
      expect(result.canClaimProductionSafety).toBe(false);
    });
  }

  for (const input of inputs) {
    it(`deriveAdapterAwarenessFromSignals handles input: ${JSON.stringify(input)}`, () => {
      const result = deriveAdapterAwarenessFromSignals(input, TEST_OPTS);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }

  for (const input of inputs) {
    it(`summarizeAdapterAwarenessIntegration handles input: ${JSON.stringify(input)}`, () => {
      const result = summarizeAdapterAwarenessIntegration(input, TEST_OPTS);
      expect(typeof result.stateId).toBe('string');
      expect(result.canClaimProductionSafety).toBe(false);
    });
  }
});

// ── 7. Input and options immutability ─────────────────────────────────────────

describe('input and options immutability', () => {
  it('normalizeAdapterAwarenessSignalInput does not mutate frozen input', () => {
    const input = Object.freeze({ sourceAdapterId: '  ls  ', targetAdapterId: 'idb' });
    const opts = Object.freeze({ enabled: true, mode: 'test' });
    const result = normalizeAdapterAwarenessSignalInput(input, opts);
    expect(result.sourceAdapterId).toBe('ls');
    expect(input.sourceAdapterId).toBe('  ls  ');
  });

  it('createAdapterAwarenessSignal does not mutate frozen input', () => {
    const input = Object.freeze({ sourceAdapterId: '  ls  ' });
    const opts = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => createAdapterAwarenessSignal(input, opts)).not.toThrow();
    expect(input.sourceAdapterId).toBe('  ls  ');
  });

  it('normalizeAdapterAwarenessSignalInput returns new object, not input reference', () => {
    const input = { sourceAdapterId: 'ls' };
    const result = normalizeAdapterAwarenessSignalInput(input, TEST_OPTS);
    expect(result).not.toBe(input);
  });
});

// ── 8. String trimming and empty string normalization ─────────────────────────

describe('string trimming and empty string normalization', () => {
  it('normalizeAdapterAwarenessSignalInput trims sourceAdapterId', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { sourceAdapterId: '  localstorage  ' },
      TEST_OPTS
    );
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('normalizeAdapterAwarenessSignalInput trims targetAdapterId', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { targetAdapterId: '\tindexeddb\n' },
      TEST_OPTS
    );
    expect(result.targetAdapterId).toBe('indexeddb');
  });

  it('normalizeAdapterAwarenessSignalInput normalizes empty sourceAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { sourceAdapterId: '' },
      TEST_OPTS
    );
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('normalizeAdapterAwarenessSignalInput normalizes whitespace-only sourceAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { sourceAdapterId: '   ' },
      TEST_OPTS
    );
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('normalizeAdapterAwarenessSignalInput normalizes empty targetAdapterId to undefined', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { targetAdapterId: '' },
      TEST_OPTS
    );
    expect(result.targetAdapterId).toBeUndefined();
  });
});

// ── 9. Alias passthrough to Phase 27C model ───────────────────────────────────

describe('alias passthrough to Phase 27C model', () => {
  it('exportAdapterId resolved as sourceAdapterId alias', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { exportAdapterId: 'localstorage' },
      TEST_OPTS
    );
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('restoreAdapterId resolved as targetAdapterId alias', () => {
    const result = normalizeAdapterAwarenessSignalInput(
      { restoreAdapterId: 'indexeddb' },
      TEST_OPTS
    );
    expect(result.targetAdapterId).toBe('indexeddb');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for same adapter context', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.stateId).toBe('same_adapter_context');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for different adapter context', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'idb' },
      TEST_OPTS
    );
    expect(result.stateId).toBe('different_adapter_context');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for missing source', () => {
    const result = createAdapterAwarenessSignal(
      { targetAdapterId: 'idb' },
      TEST_OPTS
    );
    expect(result.stateId).toBe('missing_source_adapter');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for missing target', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.stateId).toBe('missing_target_adapter');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for unavailable status', () => {
    const result = createAdapterAwarenessSignal(
      { adapterStatusUnavailable: true },
      TEST_OPTS
    );
    expect(result.stateId).toBe('adapter_status_unavailable');
  });

  it('createAdapterAwarenessSignal delegates to Phase 27C for restore rehearsal', () => {
    const result = createAdapterAwarenessSignal(
      { restoreRehearsalVerified: true, generatedTestData: true },
      TEST_OPTS
    );
    expect(result.stateId).toBe('restore_rehearsal_verified_generated_data');
  });
});

// ── 10. Disabled state id ─────────────────────────────────────────────────────

describe('disabled state id', () => {
  it('ADAPTER_INTEGRATION_DISABLED_STATE constant is adapter_integration_disabled', () => {
    expect(ADAPTER_INTEGRATION_DISABLED_STATE).toBe('adapter_integration_disabled');
  });

  it('createAdapterAwarenessSignal disabled path returns adapter_integration_disabled', () => {
    const result = createAdapterAwarenessSignal({}, undefined);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });

  it('deriveAdapterAwarenessFromSignals disabled path returns adapter_integration_disabled', () => {
    expect(deriveAdapterAwarenessFromSignals({}, undefined)).toBe('adapter_integration_disabled');
    expect(deriveAdapterAwarenessFromSignals({}, null)).toBe('adapter_integration_disabled');
    expect(deriveAdapterAwarenessFromSignals({}, {})).toBe('adapter_integration_disabled');
    expect(deriveAdapterAwarenessFromSignals({}, { enabled: false })).toBe('adapter_integration_disabled');
  });

  it('summarizeAdapterAwarenessIntegration disabled path returns adapter_integration_disabled', () => {
    const result = summarizeAdapterAwarenessIntegration({}, undefined);
    expect(result.stateId).toBe('adapter_integration_disabled');
  });
});

// ── 11. All Phase 27C state ids through enabled path ─────────────────────────

describe('all Phase 27C state ids through enabled path', () => {
  const PHASE27C_STATE_CASES = [
    {
      label: 'adapter_status_unavailable',
      input: { adapterStatusUnavailable: true },
      expected: 'adapter_status_unavailable',
    },
    {
      label: 'restore_rehearsal_verified_generated_data',
      input: { restoreRehearsalVerified: true, generatedTestData: true },
      expected: 'restore_rehearsal_verified_generated_data',
    },
    {
      label: 'missing_source_adapter',
      input: { targetAdapterId: 'idb' },
      expected: 'missing_source_adapter',
    },
    {
      label: 'missing_target_adapter',
      input: { sourceAdapterId: 'ls' },
      expected: 'missing_target_adapter',
    },
    {
      label: 'different_adapter_context',
      input: { sourceAdapterId: 'ls', targetAdapterId: 'idb' },
      expected: 'different_adapter_context',
    },
    {
      label: 'same_adapter_context',
      input: { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      expected: 'same_adapter_context',
    },
  ];

  for (const tc of PHASE27C_STATE_CASES) {
    it(`deriveAdapterAwarenessFromSignals: ${tc.label}`, () => {
      const result = deriveAdapterAwarenessFromSignals(tc.input, TEST_OPTS);
      expect(result).toBe(tc.expected);
    });

    it(`createAdapterAwarenessSignal stateId: ${tc.label}`, () => {
      const result = createAdapterAwarenessSignal(tc.input, TEST_OPTS);
      expect(result.stateId).toBe(tc.expected);
    });

    it(`summarizeAdapterAwarenessIntegration stateId: ${tc.label}`, () => {
      const result = summarizeAdapterAwarenessIntegration(tc.input, TEST_OPTS);
      expect(result.stateId).toBe(tc.expected);
    });
  }
});

// ── 12. Signal/summary object shapes ─────────────────────────────────────────

describe('signal object shape', () => {
  it('createAdapterAwarenessSignal returns all required fields (disabled)', () => {
    const result = createAdapterAwarenessSignal({}, undefined);
    expect(typeof result.integrationEnabled).toBe('boolean');
    expect(typeof result.integrationMode).toBe('string');
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.severity).toBe('string');
    expect(typeof result.messageVi).toBe('string');
    expect(typeof result.claimBoundary).toBe('string');
    expect(typeof result.canClaimProductionSafety).toBe('boolean');
    expect(typeof result.evidenceLevel).toBe('string');
  });

  it('createAdapterAwarenessSignal returns all required fields (enabled)', () => {
    const result = createAdapterAwarenessSignal({ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS);
    expect(typeof result.integrationEnabled).toBe('boolean');
    expect(typeof result.integrationMode).toBe('string');
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.severity).toBe('string');
    expect(typeof result.messageVi).toBe('string');
    expect(typeof result.claimBoundary).toBe('string');
    expect(typeof result.canClaimProductionSafety).toBe('boolean');
    expect(typeof result.evidenceLevel).toBe('string');
  });

  it('summarizeAdapterAwarenessIntegration returns all required fields (disabled)', () => {
    const result = summarizeAdapterAwarenessIntegration({}, undefined);
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.severity).toBe('string');
    expect(typeof result.labelVi).toBe('string');
    expect(typeof result.detailVi).toBe('string');
    expect(typeof result.integrationEnabled).toBe('boolean');
    expect(typeof result.integrationMode).toBe('string');
    expect(typeof result.canClaimProductionSafety).toBe('boolean');
    expect(typeof result.evidenceLevel).toBe('string');
  });

  it('summarizeAdapterAwarenessIntegration returns all required fields (enabled)', () => {
    const result = summarizeAdapterAwarenessIntegration(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.severity).toBe('string');
    expect(typeof result.labelVi).toBe('string');
    expect(typeof result.detailVi).toBe('string');
    expect(typeof result.integrationEnabled).toBe('boolean');
    expect(typeof result.integrationMode).toBe('string');
    expect(typeof result.canClaimProductionSafety).toBe('boolean');
    expect(typeof result.evidenceLevel).toBe('string');
  });
});

// ── 13. canClaimProductionSafety is always false ──────────────────────────────

describe('canClaimProductionSafety is always false', () => {
  const testCases = [
    { label: 'null input, no options', input: null, opts: undefined },
    { label: 'undefined input, no options', input: undefined, opts: undefined },
    { label: 'empty object, no options', input: {}, opts: undefined },
    { label: 'null input, enabled test', input: null, opts: TEST_OPTS },
    { label: 'empty object, enabled test', input: {}, opts: TEST_OPTS },
    { label: 'unavailable, enabled test', input: { adapterStatusUnavailable: true }, opts: TEST_OPTS },
    {
      label: 'restore rehearsal, enabled test',
      input: { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      opts: TEST_OPTS,
    },
    { label: 'missing source, enabled test', input: { targetAdapterId: 'idb' }, opts: TEST_OPTS },
    { label: 'missing target, enabled test', input: { sourceAdapterId: 'ls' }, opts: TEST_OPTS },
    { label: 'different adapters, enabled test', input: { sourceAdapterId: 'ls', targetAdapterId: 'idb' }, opts: TEST_OPTS },
    { label: 'same adapters, enabled test', input: { sourceAdapterId: 'ls', targetAdapterId: 'ls' }, opts: TEST_OPTS },
    { label: 'same adapters, default-off', input: { sourceAdapterId: 'ls', targetAdapterId: 'ls' }, opts: DEFAULT_OFF_OPTS },
    {
      label: 'unavailable, enabled: false',
      input: { adapterStatusUnavailable: true },
      opts: { enabled: false, mode: 'test' },
    },
  ];

  for (const tc of testCases) {
    it(`createAdapterAwarenessSignal canClaimProductionSafety is false: ${tc.label}`, () => {
      const result = createAdapterAwarenessSignal(tc.input, tc.opts);
      expect(result.canClaimProductionSafety).toBe(false);
    });

    it(`summarizeAdapterAwarenessIntegration canClaimProductionSafety is false: ${tc.label}`, () => {
      const result = summarizeAdapterAwarenessIntegration(tc.input, tc.opts);
      expect(result.canClaimProductionSafety).toBe(false);
    });
  }
});

// ── 14. Evidence levels ───────────────────────────────────────────────────────

describe('evidence levels', () => {
  const KNOWN_LEVELS = ['unit_static_only', 'generated_test_rehearsal_only', 'unknown'];

  it('evidenceLevel is unit_static_only in disabled path', () => {
    const result = createAdapterAwarenessSignal({}, undefined);
    expect(result.evidenceLevel).toBe('unit_static_only');
  });

  it('evidenceLevel is generated_test_rehearsal_only for restore rehearsal (enabled)', () => {
    const result = createAdapterAwarenessSignal(
      { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.evidenceLevel).toBe('generated_test_rehearsal_only');
  });

  it('evidenceLevel is unit_static_only for same adapter context (enabled)', () => {
    const result = createAdapterAwarenessSignal(
      { sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(result.evidenceLevel).toBe('unit_static_only');
  });

  it('evidenceLevel is one of known values in all cases', () => {
    const cases = [
      [null, undefined],
      [{}, undefined],
      [{ adapterStatusUnavailable: true }, TEST_OPTS],
      [{ restoreRehearsalVerified: true, generatedTestData: true }, TEST_OPTS],
      [{ sourceAdapterId: 'ls' }, TEST_OPTS],
      [{ targetAdapterId: 'idb' }, TEST_OPTS],
      [{ sourceAdapterId: 'ls', targetAdapterId: 'idb' }, TEST_OPTS],
      [{ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS],
      [{ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, DEFAULT_OFF_OPTS],
    ];

    for (const [input, opts] of cases) {
      const signal = createAdapterAwarenessSignal(input, opts);
      expect(KNOWN_LEVELS).toContain(signal.evidenceLevel);
      const summary = summarizeAdapterAwarenessIntegration(input, opts);
      expect(KNOWN_LEVELS).toContain(summary.evidenceLevel);
    }
  });
});

// ── 15. Vietnamese-first copy presence ───────────────────────────────────────

describe('Vietnamese-first copy presence', () => {
  const VI_CHAR_PATTERN = /[àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

  it('disabled path messageVi contains Vietnamese characters', () => {
    const result = createAdapterAwarenessSignal({}, undefined);
    expect(result.messageVi).toMatch(VI_CHAR_PATTERN);
  });

  it('enabled path messageVi contains Vietnamese characters', () => {
    const result = createAdapterAwarenessSignal({ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS);
    expect(result.messageVi).toMatch(VI_CHAR_PATTERN);
  });

  it('disabled path labelVi contains Vietnamese characters', () => {
    const result = summarizeAdapterAwarenessIntegration({}, undefined);
    expect(result.labelVi).toMatch(VI_CHAR_PATTERN);
  });

  it('disabled path detailVi contains Vietnamese characters', () => {
    const result = summarizeAdapterAwarenessIntegration({}, undefined);
    expect(result.detailVi).toMatch(VI_CHAR_PATTERN);
  });

  it('enabled path labelVi is non-empty', () => {
    const result = summarizeAdapterAwarenessIntegration({ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS);
    expect(result.labelVi.length).toBeGreaterThan(0);
  });

  it('enabled path detailVi is non-empty', () => {
    const result = summarizeAdapterAwarenessIntegration({ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS);
    expect(result.detailVi.length).toBeGreaterThan(0);
  });
});

// ── 16. Forbidden claim strings absent ───────────────────────────────────────

describe('forbidden claim strings absent from outputs', () => {
  const FORBIDDEN_PATTERNS = [
    /guaranteed compatibility/i,
    /guaranteed data.loss prevention/i,
    /automatic backup/i,
    /platform backup preservation/i,
    /cloud.account recovery/i,
    /production adapter.aware backup/i,
    /BETA_READY/,
    /production restore safety proven/i,
    /browser evidence confirms/i,
  ];

  function getAllStrings(input, opts) {
    const signal = createAdapterAwarenessSignal(input, opts);
    const summary = summarizeAdapterAwarenessIntegration(input, opts);
    return [
      signal.messageVi,
      signal.claimBoundary,
      summary.labelVi,
      summary.detailVi,
    ].join(' ');
  }

  const testCases = [
    [null, undefined],
    [{}, undefined],
    [{ adapterStatusUnavailable: true }, TEST_OPTS],
    [{ restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS],
    [{ sourceAdapterId: 'ls', targetAdapterId: 'ls' }, TEST_OPTS],
    [{ sourceAdapterId: 'ls', targetAdapterId: 'idb' }, TEST_OPTS],
    [{ sourceAdapterId: 'ls' }, TEST_OPTS],
    [{ targetAdapterId: 'idb' }, TEST_OPTS],
  ];

  for (const pattern of FORBIDDEN_PATTERNS) {
    it(`outputs do not contain ${pattern}`, () => {
      for (const [input, opts] of testCases) {
        expect(getAllStrings(input, opts)).not.toMatch(pattern);
      }
    });
  }
});

// ── 17. No storage/write/network/telemetry APIs in source (static check) ──────

function readIntegrationSourceNonCommentLines() {
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(
    path.resolve(process.cwd(), 'src/state/adapterAwarenessIntegrationPrototype.js'),
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

describe('no forbidden APIs in integration source (static check)', () => {
  it('source does not use localStorage', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\blocalStorage\b/);
  });

  it('source does not use indexedDB', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\bindexedDB\b/);
  });

  it('source does not use fetch(', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\bfetch\(/);
  });

  it('source does not use XMLHttpRequest', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\bXMLHttpRequest\b/);
  });

  it('source does not use sendBeacon', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\bsendBeacon\b/);
  });

  it('source does not use Date.now', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/\bDate\.now\b/);
  });

  it('source does not use telemetry or analytics', () => {
    const src = readIntegrationSourceNonCommentLines();
    expect(src).not.toMatch(/\btelemetry\b/i);
    expect(src).not.toMatch(/\banalytics\b/i);
  });

  it('source does not use process.env', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/process\.env/);
  });

  it('source does not use import.meta.env', () => {
    expect(readIntegrationSourceNonCommentLines()).not.toMatch(/import\.meta\.env/);
  });
});

// ── 18. No backup/export/restore imports in source ───────────────────────────

describe('no backup/export/restore imports in source (static check)', () => {
  it('source does not import backup/export/restore modules', () => {
    const src = readIntegrationSourceNonCommentLines();
    expect(src).not.toMatch(/import.*v2BackupRestore/);
    expect(src).not.toMatch(/import.*[Bb]ackup(?!Health)/);
    expect(src).not.toMatch(/import.*[Rr]estore/);
  });
});

// ── 19. No href/route/navigation strings in source ───────────────────────────

describe('no href/route/navigation/settings/library/dashboard strings in source', () => {
  it('source does not contain href strings', () => {
    const src = readIntegrationSourceNonCommentLines();
    expect(src).not.toMatch(/\bhref\b/);
  });

  it('source does not contain route strings', () => {
    const src = readIntegrationSourceNonCommentLines();
    expect(src).not.toMatch(/\bnavigate\b/);
    expect(src).not.toMatch(/\brouter\b/);
  });
});

// ── 20. No production module imports integration prototype ────────────────────

describe('no production module imports integration prototype (static check)', () => {
  it('production modules do not import adapterAwarenessIntegrationPrototype', () => {
    const fs = require('fs');
    const path = require('path');

    const srcDir = path.resolve(process.cwd(), 'src');
    const INTEGRATION_IMPORT_PATTERN = /adapterAwarenessIntegrationPrototype/;

    function scanDir(dir) {
      let violations = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations = violations.concat(scanDir(full));
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx')) &&
          !full.includes('adapterAwarenessIntegrationPrototype')
        ) {
          const content = fs.readFileSync(full, 'utf8');
          if (INTEGRATION_IMPORT_PATTERN.test(content)) {
            violations.push(full.replace(process.cwd() + '/', ''));
          }
        }
      }
      return violations;
    }

    const violations = scanDir(srcDir);
    expect(violations).toEqual([]);
  });
});

// ── 21. Generated/test data boundary ─────────────────────────────────────────

describe('generated/test data boundary', () => {
  it('restore_rehearsal_verified_generated_data does not imply production restore safety', () => {
    const signal = createAdapterAwarenessSignal(
      { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(signal.stateId).toBe('restore_rehearsal_verified_generated_data');
    expect(signal.canClaimProductionSafety).toBe(false);
    expect(signal.claimBoundary).toMatch(/GENERATED_TEST_REHEARSAL_ONLY/);
  });

  it('restore rehearsal summary has canClaimProductionSafety false', () => {
    const summary = summarizeAdapterAwarenessIntegration(
      { restoreRehearsalVerified: true, generatedTestData: true, sourceAdapterId: 'ls', targetAdapterId: 'ls' },
      TEST_OPTS
    );
    expect(summary.canClaimProductionSafety).toBe(false);
    expect(summary.evidenceLevel).toBe('generated_test_rehearsal_only');
  });
});
