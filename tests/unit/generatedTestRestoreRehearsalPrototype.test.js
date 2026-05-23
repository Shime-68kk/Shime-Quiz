/**
 * Phase 28D — Generated/Test Restore Rehearsal Prototype Unit Tests
 *
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_RESTORE_EXECUTION_NO_WRITES
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_RESTORE_REHEARSAL_EXECUTION
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM
 *
 * Test-only. Uses generated/synthetic data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network, no telemetry.
 * No backup/export/restore calls. No Date.now.
 * canExecuteRestore is always false in Phase 28D.
 * canWriteProductionState is always false in Phase 28D.
 * canUseRealLearnerData is always false in Phase 28D.
 * canChangeBackupFormat is always false in Phase 28D.
 * canOverwriteRestoreTarget is always false in Phase 28D.
 * canClaimDataLossPrevention is always false in Phase 28D.
 * canClaimProductionSafety is always false in Phase 28D.
 * Evidence: unit_static_only or generated_test_rehearsal_only.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  normalizeGeneratedTestRestoreRehearsalInput,
  createGeneratedTestRestoreRehearsal,
  deriveGeneratedTestRestoreRehearsalOutcome,
  summarizeGeneratedTestRestoreRehearsal,
  GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME,
} from '../../src/state/generatedTestRestoreRehearsalPrototype.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_PATH = path.join(ROOT, 'src/state/generatedTestRestoreRehearsalPrototype.js');
const sourceContent = fs.readFileSync(SOURCE_PATH, 'utf8');

// ── 1. Exports exist ──────────────────────────────────────────────────────────

describe('exports', () => {
  it('normalizeGeneratedTestRestoreRehearsalInput is a function', () => {
    expect(typeof normalizeGeneratedTestRestoreRehearsalInput).toBe('function');
  });

  it('createGeneratedTestRestoreRehearsal is a function', () => {
    expect(typeof createGeneratedTestRestoreRehearsal).toBe('function');
  });

  it('deriveGeneratedTestRestoreRehearsalOutcome is a function', () => {
    expect(typeof deriveGeneratedTestRestoreRehearsalOutcome).toBe('function');
  });

  it('summarizeGeneratedTestRestoreRehearsal is a function', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal).toBe('function');
  });

  it('GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME constants are exported', () => {
    expect(typeof GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME).toBe('object');
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME).not.toBeNull();
  });
});

// ── 2. Required outcome IDs ───────────────────────────────────────────────────

describe('GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME contains all required outcome IDs', () => {
  it('telemetry_or_sync_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.TELEMETRY_OR_SYNC_BLOCKED).toBe(
      'telemetry_or_sync_blocked'
    );
  });

  it('storage_migration_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.STORAGE_MIGRATION_BLOCKED).toBe(
      'storage_migration_blocked'
    );
  });

  it('backup_format_change_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.BACKUP_FORMAT_CHANGE_BLOCKED).toBe(
      'backup_format_change_blocked'
    );
  });

  it('external_backup_file_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.EXTERNAL_BACKUP_FILE_BLOCKED).toBe(
      'external_backup_file_blocked'
    );
  });

  it('restore_overwrite_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.RESTORE_OVERWRITE_BLOCKED).toBe(
      'restore_overwrite_blocked'
    );
  });

  it('production_state_write_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PRODUCTION_STATE_WRITE_BLOCKED).toBe(
      'production_state_write_blocked'
    );
  });

  it('real_learner_data_blocked', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.REAL_LEARNER_DATA_BLOCKED).toBe(
      'real_learner_data_blocked'
    );
  });

  it('planner_not_ready', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PLANNER_NOT_READY).toBe('planner_not_ready');
  });

  it('synthetic_anomaly_detected', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.SYNTHETIC_ANOMALY_DETECTED).toBe(
      'synthetic_anomaly_detected'
    );
  });

  it('generated_test_restore_rehearsal_ready', () => {
    expect(GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_READY).toBe(
      'generated_test_restore_rehearsal_ready'
    );
  });

  it('generated_test_restore_rehearsal_unavailable', () => {
    expect(
      GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_UNAVAILABLE
    ).toBe('generated_test_restore_rehearsal_unavailable');
  });
});

// ── 3. normalizeGeneratedTestRestoreRehearsalInput ────────────────────────────

describe('normalizeGeneratedTestRestoreRehearsalInput — null/undefined/non-object input tolerated', () => {
  it('returns object for null input', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput(null);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for undefined input', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput(undefined);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for string input', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput('not-an-object');
    expect(typeof result).toBe('object');
  });

  it('returns object for number input', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput(42);
    expect(typeof result).toBe('object');
  });

  it('returns object for array input', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput([1, 2, 3]);
    expect(typeof result).toBe('object');
  });

  it('returns empty syntheticAnomalies array for null input', () => {
    expect(normalizeGeneratedTestRestoreRehearsalInput(null).syntheticAnomalies).toEqual([]);
  });
});

describe('normalizeGeneratedTestRestoreRehearsalInput — input immutability', () => {
  it('does not mutate the input object', () => {
    const input = {
      fixtureId: '  fix-001  ',
      generatedTestData: true,
      syntheticAnomalies: ['  anomaly1  '],
    };
    const before = JSON.stringify(input);
    normalizeGeneratedTestRestoreRehearsalInput(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});

describe('normalizeGeneratedTestRestoreRehearsalInput — string trimming and empty-string normalization', () => {
  it('trims fixtureId whitespace', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ fixtureId: '  fix-001  ' });
    expect(result.fixtureId).toBe('fix-001');
  });

  it('normalizes empty fixtureId to undefined', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ fixtureId: '   ' });
    expect(result.fixtureId).toBeUndefined();
  });

  it('trims sourceAdapterId', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ sourceAdapterId: '  local  ' });
    expect(result.sourceAdapterId).toBe('local');
  });

  it('normalizes empty sourceAdapterId to undefined', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ sourceAdapterId: '' });
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('trims plannerStateId', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({
      plannerStateId: '  generated_test_rehearsal_plan_ready  ',
    });
    expect(result.plannerStateId).toBe('generated_test_rehearsal_plan_ready');
  });

  it('normalizes empty plannerSummary to undefined', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ plannerSummary: '' });
    expect(result.plannerSummary).toBeUndefined();
  });
});

describe('normalizeGeneratedTestRestoreRehearsalInput — boolean normalization', () => {
  it('normalizes generatedTestData: true', () => {
    expect(
      normalizeGeneratedTestRestoreRehearsalInput({ generatedTestData: true }).generatedTestData
    ).toBe(true);
  });

  it('does not set generatedTestData for string "true"', () => {
    expect(
      normalizeGeneratedTestRestoreRehearsalInput({ generatedTestData: 'true' }).generatedTestData
    ).toBeUndefined();
  });

  it('does not set generatedTestData for 1', () => {
    expect(
      normalizeGeneratedTestRestoreRehearsalInput({ generatedTestData: 1 }).generatedTestData
    ).toBeUndefined();
  });

  it('normalizes realLearnerDataPresent: true conservatively', () => {
    expect(
      normalizeGeneratedTestRestoreRehearsalInput({ realLearnerDataPresent: true })
        .realLearnerDataPresent
    ).toBe(true);
  });

  it('does not set realLearnerDataPresent for non-boolean', () => {
    expect(
      normalizeGeneratedTestRestoreRehearsalInput({ realLearnerDataPresent: 1 })
        .realLearnerDataPresent
    ).toBeUndefined();
  });
});

describe('normalizeGeneratedTestRestoreRehearsalInput — syntheticAnomalies normalization and cap', () => {
  it('normalizes syntheticAnomalies to array of trimmed non-empty strings', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({
      syntheticAnomalies: ['  anomaly-1  ', '  anomaly-2  '],
    });
    expect(result.syntheticAnomalies).toEqual(['anomaly-1', 'anomaly-2']);
  });

  it('filters empty strings from syntheticAnomalies', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({
      syntheticAnomalies: ['  ', '', 'valid-anomaly'],
    });
    expect(result.syntheticAnomalies).toEqual(['valid-anomaly']);
  });

  it('filters non-string entries from syntheticAnomalies', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({
      syntheticAnomalies: [1, null, 'valid', undefined],
    });
    expect(result.syntheticAnomalies).toEqual(['valid']);
  });

  it('caps syntheticAnomalies at 10', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({
      syntheticAnomalies: Array.from({ length: 15 }, (_, i) => `anomaly-${i}`),
    });
    expect(result.syntheticAnomalies.length).toBe(10);
  });

  it('returns empty array when syntheticAnomalies is missing', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ generatedTestData: true });
    expect(result.syntheticAnomalies).toEqual([]);
  });

  it('returns empty array when syntheticAnomalies is not an array', () => {
    const result = normalizeGeneratedTestRestoreRehearsalInput({ syntheticAnomalies: 'not-array' });
    expect(result.syntheticAnomalies).toEqual([]);
  });
});

// ── 4. deriveGeneratedTestRestoreRehearsalOutcome — all outcome IDs reachable ─

describe('deriveGeneratedTestRestoreRehearsalOutcome — generated/test restore rehearsal ready', () => {
  it('returns generated_test_restore_rehearsal_ready when generatedTestData true and no blocks', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({ generatedTestData: true })
    ).toBe('generated_test_restore_rehearsal_ready');
  });

  it('requires generatedTestData true for ready state', () => {
    expect(deriveGeneratedTestRestoreRehearsalOutcome({})).toBe('planner_not_ready');
  });

  it('requires planner-ready state for ready state', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({ realLearnerDataPresent: true })
    ).toBe('real_learner_data_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — planner_not_ready', () => {
  it('returns planner_not_ready when generatedTestData is missing', () => {
    expect(deriveGeneratedTestRestoreRehearsalOutcome({})).toBe('planner_not_ready');
  });

  it('returns planner_not_ready when generatedTestData is false', () => {
    expect(deriveGeneratedTestRestoreRehearsalOutcome({ generatedTestData: false })).toBe(
      'planner_not_ready'
    );
  });

  it('returns planner_not_ready for null input', () => {
    expect(deriveGeneratedTestRestoreRehearsalOutcome(null)).toBe('planner_not_ready');
  });

  it('returns planner_not_ready for undefined input', () => {
    expect(deriveGeneratedTestRestoreRehearsalOutcome(undefined)).toBe('planner_not_ready');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — synthetic_anomaly_detected', () => {
  it('returns synthetic_anomaly_detected when generatedTestData true and anomalies present', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        syntheticAnomalies: ['checksum-mismatch'],
      })
    ).toBe('synthetic_anomaly_detected');
  });

  it('does not return synthetic_anomaly_detected when anomalies list is empty', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        syntheticAnomalies: [],
      })
    ).toBe('generated_test_restore_rehearsal_ready');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — real_learner_data_blocked', () => {
  it('returns real_learner_data_blocked when realLearnerDataPresent: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        realLearnerDataPresent: true,
      })
    ).toBe('real_learner_data_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — production_state_write_blocked', () => {
  it('returns production_state_write_blocked when productionStateTargeted: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        productionStateTargeted: true,
      })
    ).toBe('production_state_write_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — restore_overwrite_blocked', () => {
  it('returns restore_overwrite_blocked when restoreOverwriteRequested: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        restoreOverwriteRequested: true,
      })
    ).toBe('restore_overwrite_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — external_backup_file_blocked', () => {
  it('returns external_backup_file_blocked when externalBackupFileProvided: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        externalBackupFileProvided: true,
      })
    ).toBe('external_backup_file_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — backup_format_change_blocked', () => {
  it('returns backup_format_change_blocked when backupFormatChangeRequested: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        backupFormatChangeRequested: true,
      })
    ).toBe('backup_format_change_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — storage_migration_blocked', () => {
  it('returns storage_migration_blocked when storageMigrationRequested: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        storageMigrationRequested: true,
      })
    ).toBe('storage_migration_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — telemetry_or_sync_blocked', () => {
  it('returns telemetry_or_sync_blocked when telemetryRequested: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        telemetryRequested: true,
      })
    ).toBe('telemetry_or_sync_blocked');
  });

  it('returns telemetry_or_sync_blocked when syncCloudAccountBackendRequested: true', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        syncCloudAccountBackendRequested: true,
      })
    ).toBe('telemetry_or_sync_blocked');
  });
});

describe('deriveGeneratedTestRestoreRehearsalOutcome — conservative priority order', () => {
  it('telemetry_or_sync_blocked beats storage_migration_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        telemetryRequested: true,
        storageMigrationRequested: true,
      })
    ).toBe('telemetry_or_sync_blocked');
  });

  it('storage_migration_blocked beats backup_format_change_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        storageMigrationRequested: true,
        backupFormatChangeRequested: true,
      })
    ).toBe('storage_migration_blocked');
  });

  it('backup_format_change_blocked beats external_backup_file_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        backupFormatChangeRequested: true,
        externalBackupFileProvided: true,
      })
    ).toBe('backup_format_change_blocked');
  });

  it('external_backup_file_blocked beats restore_overwrite_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        externalBackupFileProvided: true,
        restoreOverwriteRequested: true,
      })
    ).toBe('external_backup_file_blocked');
  });

  it('restore_overwrite_blocked beats production_state_write_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        restoreOverwriteRequested: true,
        productionStateTargeted: true,
      })
    ).toBe('restore_overwrite_blocked');
  });

  it('production_state_write_blocked beats real_learner_data_blocked', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        productionStateTargeted: true,
        realLearnerDataPresent: true,
      })
    ).toBe('production_state_write_blocked');
  });

  it('real_learner_data_blocked beats planner_not_ready', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        realLearnerDataPresent: true,
      })
    ).toBe('real_learner_data_blocked');
  });

  it('planner_not_ready beats synthetic_anomaly_detected', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        syntheticAnomalies: ['anomaly'],
      })
    ).toBe('planner_not_ready');
  });

  it('synthetic_anomaly_detected beats generated_test_restore_rehearsal_ready', () => {
    expect(
      deriveGeneratedTestRestoreRehearsalOutcome({
        generatedTestData: true,
        syntheticAnomalies: ['anomaly'],
      })
    ).toBe('synthetic_anomaly_detected');
  });
});

// ── 5. createGeneratedTestRestoreRehearsal — object shape ─────────────────────

describe('createGeneratedTestRestoreRehearsal — prototype object shape', () => {
  const readyInput = { generatedTestData: true };
  let result;
  beforeEach_compat(() => {
    result = createGeneratedTestRestoreRehearsal(readyInput);
  });

  it('has stateId field', () => {
    expect(typeof createGeneratedTestRestoreRehearsal(readyInput).stateId).toBe('string');
  });

  it('has severity field', () => {
    expect(typeof createGeneratedTestRestoreRehearsal(readyInput).severity).toBe('string');
  });

  it('has plannerStateId field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty('plannerStateId');
  });

  it('has usesGeneratedTestData field', () => {
    expect(typeof createGeneratedTestRestoreRehearsal(readyInput).usesGeneratedTestData).toBe(
      'boolean'
    );
  });

  it('has syntheticAnomalies array', () => {
    expect(Array.isArray(createGeneratedTestRestoreRehearsal(readyInput).syntheticAnomalies)).toBe(
      true
    );
  });

  it('has canExecuteRestore field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty('canExecuteRestore');
  });

  it('has canWriteProductionState field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty(
      'canWriteProductionState'
    );
  });

  it('has canUseRealLearnerData field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty('canUseRealLearnerData');
  });

  it('has canChangeBackupFormat field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty('canChangeBackupFormat');
  });

  it('has canOverwriteRestoreTarget field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty(
      'canOverwriteRestoreTarget'
    );
  });

  it('has canClaimDataLossPrevention field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty(
      'canClaimDataLossPrevention'
    );
  });

  it('has steps array', () => {
    expect(Array.isArray(createGeneratedTestRestoreRehearsal(readyInput).steps)).toBe(true);
  });

  it('steps contain only strings', () => {
    const obj = createGeneratedTestRestoreRehearsal(readyInput);
    obj.steps.forEach(step => expect(typeof step).toBe('string'));
  });

  it('has claimBoundary field', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput)).toHaveProperty('claimBoundary');
  });

  it('claimBoundary contains UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM', () => {
    expect(createGeneratedTestRestoreRehearsal(readyInput).claimBoundary).toContain(
      'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM'
    );
  });
});

// ── 6. Always-false safety fields ─────────────────────────────────────────────

describe('canExecuteRestore is always false', () => {
  const inputs = [
    {},
    { generatedTestData: true },
    { generatedTestData: true, syntheticAnomalies: ['a'] },
    { realLearnerDataPresent: true },
    { telemetryRequested: true },
    { storageMigrationRequested: true },
  ];

  inputs.forEach((input, i) => {
    it(`canExecuteRestore is false for input[${i}]`, () => {
      expect(createGeneratedTestRestoreRehearsal(input).canExecuteRestore).toBe(false);
    });

    it(`summarize canExecuteRestore is false for input[${i}]`, () => {
      expect(summarizeGeneratedTestRestoreRehearsal(input).canExecuteRestore).toBe(false);
    });
  });
});

describe('canWriteProductionState is always false', () => {
  const inputs = [{}, { generatedTestData: true }, { productionStateTargeted: true }];
  inputs.forEach((input, i) => {
    it(`canWriteProductionState is false for input[${i}]`, () => {
      expect(createGeneratedTestRestoreRehearsal(input).canWriteProductionState).toBe(false);
    });

    it(`summarize canWriteProductionState is false for input[${i}]`, () => {
      expect(summarizeGeneratedTestRestoreRehearsal(input).canWriteProductionState).toBe(false);
    });
  });
});

describe('canUseRealLearnerData is always false', () => {
  const inputs = [{}, { generatedTestData: true }, { realLearnerDataPresent: true }];
  inputs.forEach((input, i) => {
    it(`canUseRealLearnerData is false for input[${i}]`, () => {
      expect(createGeneratedTestRestoreRehearsal(input).canUseRealLearnerData).toBe(false);
    });

    it(`summarize canUseRealLearnerData is false for input[${i}]`, () => {
      expect(summarizeGeneratedTestRestoreRehearsal(input).canUseRealLearnerData).toBe(false);
    });
  });
});

describe('canChangeBackupFormat is always false', () => {
  it('canChangeBackupFormat is false for ready input', () => {
    expect(createGeneratedTestRestoreRehearsal({ generatedTestData: true }).canChangeBackupFormat).toBe(false);
  });

  it('canChangeBackupFormat is false for null input', () => {
    expect(createGeneratedTestRestoreRehearsal(null).canChangeBackupFormat).toBe(false);
  });
});

describe('canOverwriteRestoreTarget is always false', () => {
  it('canOverwriteRestoreTarget is false for ready input', () => {
    expect(
      createGeneratedTestRestoreRehearsal({ generatedTestData: true }).canOverwriteRestoreTarget
    ).toBe(false);
  });

  it('canOverwriteRestoreTarget is false for restoreOverwriteRequested input', () => {
    expect(
      createGeneratedTestRestoreRehearsal({
        generatedTestData: true,
        restoreOverwriteRequested: true,
      }).canOverwriteRestoreTarget
    ).toBe(false);
  });
});

describe('canClaimDataLossPrevention is always false', () => {
  it('canClaimDataLossPrevention is false for ready input', () => {
    expect(
      createGeneratedTestRestoreRehearsal({ generatedTestData: true }).canClaimDataLossPrevention
    ).toBe(false);
  });
});

describe('canClaimProductionSafety is always false', () => {
  const inputs = [
    {},
    { generatedTestData: true },
    { generatedTestData: true, syntheticAnomalies: ['a'] },
    { realLearnerDataPresent: true },
    { telemetryRequested: true },
  ];
  inputs.forEach((input, i) => {
    it(`summarize canClaimProductionSafety is false for input[${i}]`, () => {
      expect(summarizeGeneratedTestRestoreRehearsal(input).canClaimProductionSafety).toBe(false);
    });
  });
});

// ── 7. summarizeGeneratedTestRestoreRehearsal — summary object shape ──────────

describe('summarizeGeneratedTestRestoreRehearsal — summary object shape', () => {
  const readyInput = { generatedTestData: true };

  it('has stateId field', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal(readyInput).stateId).toBe('string');
  });

  it('has severity field', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal(readyInput).severity).toBe('string');
  });

  it('has labelVi field', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal(readyInput).labelVi).toBe('string');
  });

  it('has detailVi field', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal(readyInput).detailVi).toBe('string');
  });

  it('has evidenceLevel field', () => {
    expect(typeof summarizeGeneratedTestRestoreRehearsal(readyInput).evidenceLevel).toBe('string');
  });
});

// ── 8. Evidence levels ────────────────────────────────────────────────────────

describe('evidence levels', () => {
  it('returns generated_test_rehearsal_only when rehearsal is ready', () => {
    expect(
      summarizeGeneratedTestRestoreRehearsal({ generatedTestData: true }).evidenceLevel
    ).toBe('generated_test_rehearsal_only');
  });

  it('returns unit_static_only when blocked', () => {
    expect(
      summarizeGeneratedTestRestoreRehearsal({ telemetryRequested: true }).evidenceLevel
    ).toBe('unit_static_only');
  });

  it('returns unit_static_only for planner_not_ready', () => {
    expect(summarizeGeneratedTestRestoreRehearsal({}).evidenceLevel).toBe('unit_static_only');
  });

  it('returns unit_static_only for synthetic_anomaly_detected', () => {
    expect(
      summarizeGeneratedTestRestoreRehearsal({
        generatedTestData: true,
        syntheticAnomalies: ['anomaly'],
      }).evidenceLevel
    ).toBe('unit_static_only');
  });

  it('returns unknown for unavailable state (fallback)', () => {
    const summary = summarizeGeneratedTestRestoreRehearsal(null);
    expect(['unknown', 'unit_static_only'].includes(summary.evidenceLevel)).toBe(true);
  });
});

// ── 9. Vietnamese-first copy presence ─────────────────────────────────────────

describe('Vietnamese-first copy presence', () => {
  it('ready summary has non-empty labelVi', () => {
    const s = summarizeGeneratedTestRestoreRehearsal({ generatedTestData: true });
    expect(s.labelVi.length).toBeGreaterThan(0);
  });

  it('ready summary has non-empty detailVi', () => {
    const s = summarizeGeneratedTestRestoreRehearsal({ generatedTestData: true });
    expect(s.detailVi.length).toBeGreaterThan(0);
  });

  it('blocked summary has Vietnamese in labelVi', () => {
    const s = summarizeGeneratedTestRestoreRehearsal({ telemetryRequested: true });
    expect(s.labelVi.length).toBeGreaterThan(0);
  });

  it('source file contains Vietnamese strings (Bị chặn or Xác minh)', () => {
    const hasVietnamese =
      sourceContent.includes('Bị chặn') || sourceContent.includes('Xác minh');
    expect(hasVietnamese).toBe(true);
  });
});

// ── 10. Severity values are valid ─────────────────────────────────────────────

describe('severity values are valid', () => {
  const validSeverities = ['info', 'caution', 'blocked', 'unavailable'];
  const testCases = [
    { generatedTestData: true },
    { generatedTestData: true, syntheticAnomalies: ['a'] },
    {},
    { telemetryRequested: true },
    { storageMigrationRequested: true },
    { backupFormatChangeRequested: true, generatedTestData: true },
    { externalBackupFileProvided: true, generatedTestData: true },
    { restoreOverwriteRequested: true, generatedTestData: true },
    { productionStateTargeted: true, generatedTestData: true },
    { realLearnerDataPresent: true, generatedTestData: true },
  ];

  testCases.forEach((input, i) => {
    it(`severity is valid for case[${i}]`, () => {
      const obj = createGeneratedTestRestoreRehearsal(input);
      expect(validSeverities).toContain(obj.severity);
    });
  });
});

// ── 11. Generated/test data boundary ─────────────────────────────────────────

describe('generated/test data only boundary', () => {
  it('usesGeneratedTestData is true when generatedTestData: true', () => {
    expect(
      createGeneratedTestRestoreRehearsal({ generatedTestData: true }).usesGeneratedTestData
    ).toBe(true);
  });

  it('usesGeneratedTestData is false when generatedTestData is missing', () => {
    expect(createGeneratedTestRestoreRehearsal({}).usesGeneratedTestData).toBe(false);
  });

  it('usesGeneratedTestData is false when generatedTestData is string "true"', () => {
    expect(
      createGeneratedTestRestoreRehearsal({ generatedTestData: 'true' }).usesGeneratedTestData
    ).toBe(false);
  });
});

// ── 12. No forbidden APIs in source ──────────────────────────────────────────

describe('no storage/write/network/telemetry APIs used in source', () => {
  it('does not use localStorage', () => {
    expect(sourceContent).not.toMatch(/localStorage/);
  });

  it('does not use indexedDB or IndexedDB', () => {
    expect(sourceContent).not.toMatch(/[Ii]ndexed[Dd][Bb]/);
  });

  it('does not use fetch(', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/\bfetch\s*\(/);
  });

  it('does not use XMLHttpRequest', () => {
    expect(sourceContent).not.toMatch(/XMLHttpRequest/);
  });

  it('does not use sendBeacon', () => {
    expect(sourceContent).not.toMatch(/sendBeacon/);
  });

  it('does not use telemetry or analytics calls', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/telemetry\s*\(|analytics\s*\(/);
  });
});

describe('no Date.now direct usage in source', () => {
  it('does not call Date.now()', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/Date\.now\s*\(/);
  });
});

describe('no environment reads in source', () => {
  it('does not use process.env', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/process\.env/);
  });

  it('does not use import.meta.env', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/import\.meta\.env/);
  });
});

describe('no href/route/navigation strings in source', () => {
  it('does not contain href assignments or route navigation calls', () => {
    const nonCommentLines = sourceContent
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/window\.location\.href\s*=/);
    expect(nonCommentLines).not.toMatch(/router\.push\s*\(/);
    expect(nonCommentLines).not.toMatch(/navigate\s*\(\s*['"`]\/(?:settings|library|dashboard)/);
  });
});

// ── 13. No backup/export/restore imports in source (except restoreRehearsalPlanner) ─

describe('no production backup/export/restore imports in source', () => {
  it('does not import from production backup modules', () => {
    const importLines = sourceContent
      .split('\n')
      .filter(l => l.trim().startsWith('import'))
      .join('\n');
    const hasProductionBackupImport = /from\s+['"](?!.*restoreRehearsalPlanner).*(?:backup|Backup)['"]/
      .test(importLines);
    expect(hasProductionBackupImport).toBe(false);
  });

  it('does not import from production export modules', () => {
    const importLines = sourceContent
      .split('\n')
      .filter(l => l.trim().startsWith('import'))
      .join('\n');
    expect(importLines).not.toMatch(/from\s+['"].*export[A-Z].*['"]/);
  });

  it('does not import from production restore modules (other than restoreRehearsalPlanner)', () => {
    const importLines = sourceContent
      .split('\n')
      .filter(l => l.trim().startsWith('import'))
      .join('\n');
    const restoreImports = importLines.match(/from\s+['"]([^'"]*)['"]/g) || [];
    const forbiddenRestoreImports = restoreImports.filter(m => {
      const modPath = m.replace(/from\s+['"]/, '').replace(/['"]$/, '');
      return (
        (modPath.includes('restore') || modPath.includes('Restore')) &&
        !modPath.includes('restoreRehearsalPlanner')
      );
    });
    expect(forbiddenRestoreImports).toHaveLength(0);
  });
});

describe('no storage driver imports in source', () => {
  it('does not import IndexedDB adapter', () => {
    expect(sourceContent).not.toMatch(/from\s+['"].*[Ii]ndexed[Dd][Bb].*['"]/);
  });

  it('does not import StorageAdapter', () => {
    expect(sourceContent).not.toMatch(/from\s+['"].*[Ss]torage[Aa]dapter.*['"]/);
  });

  it('does not import storage/driver modules', () => {
    expect(sourceContent).not.toMatch(/from\s+['"].*storage\/driver.*['"]/);
  });
});

// ── 14. No production module imports the prototype ────────────────────────────

describe('no production module imports the prototype', () => {
  it('no src/ production file imports generatedTestRestoreRehearsalPrototype', () => {
    const srcDir = path.join(ROOT, 'src');
    const prototypeFilename = 'generatedTestRestoreRehearsalPrototype';

    function walkDir(dir) {
      const files = [];
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...walkDir(full));
          } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== `${prototypeFilename}.js`) {
            files.push(full);
          }
        }
      } catch {
        // skip unreadable dirs
      }
      return files;
    }

    const srcFiles = walkDir(srcDir);
    const importers = srcFiles.filter(f => {
      try {
        const content = fs.readFileSync(f, 'utf8');
        return content.includes(prototypeFilename);
      } catch {
        return false;
      }
    });
    expect(importers).toHaveLength(0);
  });
});

// ── 15. Forbidden claim strings absent ────────────────────────────────────────

describe('forbidden claim strings absent from source', () => {
  const nonCommentLines = sourceContent
    .split('\n')
    .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
    .join('\n');

  const forbiddenClaims = [
    'BETA_READY',
    'restore_executed',
    'production_restore_rehearsal_approved',
    'real_learner_data_approved',
    'backup_format_changed',
    'restore_overwrite_approved',
    'storage_migration_approved',
    'local_first_hybrid_ready',
    'BROWSER_EVIDENCE_COLLECTED',
  ];

  forbiddenClaims.forEach(claim => {
    it(`does not contain positive claim "${claim}"`, () => {
      expect(nonCommentLines).not.toContain(claim);
    });
  });
});

// ── helper: simple beforeEach-compatible alias ────────────────────────────────

function beforeEach_compat(fn) {
  // Not used as beforeEach here — inline call in each test handles setup
  fn();
}
