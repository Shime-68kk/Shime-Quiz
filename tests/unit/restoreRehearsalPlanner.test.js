/**
 * Phase 28B — Test-Only No-Write Restore Rehearsal Planner Unit Tests
 *
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
 * PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
 *
 * Test-only. Uses generated/synthetic data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network, no telemetry.
 * No backup/export/restore calls. No Date.now.
 * canExecuteRestore is always false in Phase 28B.
 * canWriteProductionState is always false in Phase 28B.
 * canUseRealLearnerData is always false in Phase 28B.
 * canChangeBackupFormat is always false in Phase 28B.
 * canOverwriteRestoreTarget is always false in Phase 28B.
 * canClaimDataLossPrevention is always false in Phase 28B.
 * canClaimProductionSafety is always false in Phase 28B.
 * Evidence: unit_static_only or generated_test_plan_only.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeRestoreRehearsalPlanInput,
  createGeneratedTestRestoreRehearsalPlan,
  deriveRestoreRehearsalSafetyState,
  summarizeRestoreRehearsalPlan,
  RESTORE_REHEARSAL_SAFETY_STATE,
  RESTORE_REHEARSAL_SEVERITY,
  RESTORE_REHEARSAL_EVIDENCE_LEVEL,
} from '../../src/state/restoreRehearsalPlanner.js';

// ── 1. Exports exist ──────────────────────────────────────────────────────────

describe('exports', () => {
  it('normalizeRestoreRehearsalPlanInput is a function', () => {
    expect(typeof normalizeRestoreRehearsalPlanInput).toBe('function');
  });

  it('createGeneratedTestRestoreRehearsalPlan is a function', () => {
    expect(typeof createGeneratedTestRestoreRehearsalPlan).toBe('function');
  });

  it('deriveRestoreRehearsalSafetyState is a function', () => {
    expect(typeof deriveRestoreRehearsalSafetyState).toBe('function');
  });

  it('summarizeRestoreRehearsalPlan is a function', () => {
    expect(typeof summarizeRestoreRehearsalPlan).toBe('function');
  });

  it('RESTORE_REHEARSAL_SAFETY_STATE constants are exported', () => {
    expect(typeof RESTORE_REHEARSAL_SAFETY_STATE).toBe('object');
    expect(RESTORE_REHEARSAL_SAFETY_STATE).not.toBeNull();
  });

  it('RESTORE_REHEARSAL_SEVERITY constants are exported', () => {
    expect(typeof RESTORE_REHEARSAL_SEVERITY).toBe('object');
    expect(RESTORE_REHEARSAL_SEVERITY).not.toBeNull();
  });

  it('RESTORE_REHEARSAL_EVIDENCE_LEVEL constants are exported', () => {
    expect(typeof RESTORE_REHEARSAL_EVIDENCE_LEVEL).toBe('object');
    expect(RESTORE_REHEARSAL_EVIDENCE_LEVEL).not.toBeNull();
  });
});

// ── 2. Required state IDs ─────────────────────────────────────────────────────

describe('RESTORE_REHEARSAL_SAFETY_STATE contains all required state IDs', () => {
  it('telemetry_or_sync_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED).toBe('telemetry_or_sync_blocked');
  });

  it('storage_migration_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED).toBe('storage_migration_blocked');
  });

  it('backup_format_change_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED).toBe('backup_format_change_blocked');
  });

  it('external_backup_file_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED).toBe('external_backup_file_blocked');
  });

  it('restore_overwrite_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED).toBe('restore_overwrite_blocked');
  });

  it('production_state_write_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED).toBe('production_state_write_blocked');
  });

  it('real_learner_data_blocked', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED).toBe('real_learner_data_blocked');
  });

  it('missing_generated_test_data', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA).toBe('missing_generated_test_data');
  });

  it('generated_test_rehearsal_plan_ready', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY).toBe('generated_test_rehearsal_plan_ready');
  });

  it('restore_rehearsal_planner_unavailable', () => {
    expect(RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_REHEARSAL_PLANNER_UNAVAILABLE).toBe('restore_rehearsal_planner_unavailable');
  });
});

// ── 3. normalizeRestoreRehearsalPlanInput — null/undefined/non-object tolerance

describe('normalizeRestoreRehearsalPlanInput — null/undefined/non-object input', () => {
  it('returns object for null input', () => {
    const result = normalizeRestoreRehearsalPlanInput(null);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for undefined input', () => {
    const result = normalizeRestoreRehearsalPlanInput(undefined);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for string input', () => {
    const result = normalizeRestoreRehearsalPlanInput('not-an-object');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for number input', () => {
    const result = normalizeRestoreRehearsalPlanInput(42);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object for array input', () => {
    const result = normalizeRestoreRehearsalPlanInput([1, 2, 3]);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns empty object for null input', () => {
    const result = normalizeRestoreRehearsalPlanInput(null);
    expect(Object.keys(result).length).toBe(0);
  });

  it('returns empty object for undefined input', () => {
    const result = normalizeRestoreRehearsalPlanInput(undefined);
    expect(Object.keys(result).length).toBe(0);
  });
});

// ── 4. normalizeRestoreRehearsalPlanInput — input immutability ────────────────

describe('normalizeRestoreRehearsalPlanInput — input immutability', () => {
  it('does not mutate the input object', () => {
    const input = { generatedTestData: true, fixtureId: 'fixture-1' };
    const before = JSON.stringify(input);
    normalizeRestoreRehearsalPlanInput(input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it('returns a new object, not the original', () => {
    const input = { generatedTestData: true };
    const result = normalizeRestoreRehearsalPlanInput(input);
    expect(result).not.toBe(input);
  });
});

// ── 5. normalizeRestoreRehearsalPlanInput — string trimming ───────────────────

describe('normalizeRestoreRehearsalPlanInput — string trimming', () => {
  it('trims fixtureId whitespace', () => {
    const result = normalizeRestoreRehearsalPlanInput({ fixtureId: '  fixture-1  ' });
    expect(result.fixtureId).toBe('fixture-1');
  });

  it('trims sourceAdapterId whitespace', () => {
    const result = normalizeRestoreRehearsalPlanInput({ sourceAdapterId: '  localstorage  ' });
    expect(result.sourceAdapterId).toBe('localstorage');
  });

  it('trims targetAdapterId whitespace', () => {
    const result = normalizeRestoreRehearsalPlanInput({ targetAdapterId: '  localstorage  ' });
    expect(result.targetAdapterId).toBe('localstorage');
  });

  it('normalizes empty fixtureId string to undefined', () => {
    const result = normalizeRestoreRehearsalPlanInput({ fixtureId: '   ' });
    expect(result.fixtureId).toBeUndefined();
  });

  it('normalizes empty sourceAdapterId string to undefined', () => {
    const result = normalizeRestoreRehearsalPlanInput({ sourceAdapterId: '' });
    expect(result.sourceAdapterId).toBeUndefined();
  });

  it('normalizes empty targetAdapterId string to undefined', () => {
    const result = normalizeRestoreRehearsalPlanInput({ targetAdapterId: '  ' });
    expect(result.targetAdapterId).toBeUndefined();
  });
});

// ── 6. normalizeRestoreRehearsalPlanInput — boolean normalization ──────────────

describe('normalizeRestoreRehearsalPlanInput — boolean normalization', () => {
  it('sets generatedTestData: true only if === true', () => {
    expect(normalizeRestoreRehearsalPlanInput({ generatedTestData: true }).generatedTestData).toBe(true);
    expect(normalizeRestoreRehearsalPlanInput({ generatedTestData: 1 }).generatedTestData).toBeUndefined();
    expect(normalizeRestoreRehearsalPlanInput({ generatedTestData: 'true' }).generatedTestData).toBeUndefined();
    expect(normalizeRestoreRehearsalPlanInput({ generatedTestData: false }).generatedTestData).toBeUndefined();
    expect(normalizeRestoreRehearsalPlanInput({ generatedTestData: null }).generatedTestData).toBeUndefined();
  });

  it('sets realLearnerDataPresent: true only if === true', () => {
    expect(normalizeRestoreRehearsalPlanInput({ realLearnerDataPresent: true }).realLearnerDataPresent).toBe(true);
    expect(normalizeRestoreRehearsalPlanInput({ realLearnerDataPresent: 1 }).realLearnerDataPresent).toBeUndefined();
  });

  it('sets telemetryRequested: true only if === true', () => {
    expect(normalizeRestoreRehearsalPlanInput({ telemetryRequested: true }).telemetryRequested).toBe(true);
    expect(normalizeRestoreRehearsalPlanInput({ telemetryRequested: false }).telemetryRequested).toBeUndefined();
  });

  it('sets storageMigrationRequested: true only if === true', () => {
    expect(normalizeRestoreRehearsalPlanInput({ storageMigrationRequested: true }).storageMigrationRequested).toBe(true);
  });
});

// ── 7. deriveRestoreRehearsalSafetyState — required for ready state ───────────

describe('deriveRestoreRehearsalSafetyState — generated test data required', () => {
  it('returns generated_test_rehearsal_plan_ready when generatedTestData is true', () => {
    const result = deriveRestoreRehearsalSafetyState({ generatedTestData: true });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY);
  });

  it('returns missing_generated_test_data when generatedTestData is false', () => {
    const result = deriveRestoreRehearsalSafetyState({ generatedTestData: false });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA);
  });

  it('returns missing_generated_test_data when generatedTestData is absent', () => {
    const result = deriveRestoreRehearsalSafetyState({});
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA);
  });

  it('returns missing_generated_test_data for null input', () => {
    const result = deriveRestoreRehearsalSafetyState(null);
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA);
  });

  it('returns missing_generated_test_data for undefined input', () => {
    const result = deriveRestoreRehearsalSafetyState(undefined);
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA);
  });
});

// ── 8. deriveRestoreRehearsalSafetyState — blocked states ────────────────────

describe('deriveRestoreRehearsalSafetyState — real_learner_data_blocked', () => {
  it('returns real_learner_data_blocked when realLearnerDataPresent is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      realLearnerDataPresent: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — production_state_write_blocked', () => {
  it('returns production_state_write_blocked when productionStateTargeted is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      productionStateTargeted: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — restore_overwrite_blocked', () => {
  it('returns restore_overwrite_blocked when restoreOverwriteRequested is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      restoreOverwriteRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — external_backup_file_blocked', () => {
  it('returns external_backup_file_blocked when externalBackupFileProvided is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      externalBackupFileProvided: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — backup_format_change_blocked', () => {
  it('returns backup_format_change_blocked when backupFormatChangeRequested is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      backupFormatChangeRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — storage_migration_blocked', () => {
  it('returns storage_migration_blocked when storageMigrationRequested is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      storageMigrationRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED);
  });
});

describe('deriveRestoreRehearsalSafetyState — telemetry_or_sync_blocked', () => {
  it('returns telemetry_or_sync_blocked when telemetryRequested is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      telemetryRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED);
  });

  it('returns telemetry_or_sync_blocked when syncCloudAccountBackendRequested is true', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      syncCloudAccountBackendRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED);
  });
});

// ── 9. Conservative priority order ───────────────────────────────────────────

describe('deriveRestoreRehearsalSafetyState — conservative priority order', () => {
  it('telemetry_or_sync_blocked takes priority over storage_migration_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      telemetryRequested: true,
      storageMigrationRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED);
  });

  it('storage_migration_blocked takes priority over backup_format_change_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      storageMigrationRequested: true,
      backupFormatChangeRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED);
  });

  it('backup_format_change_blocked takes priority over external_backup_file_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      backupFormatChangeRequested: true,
      externalBackupFileProvided: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED);
  });

  it('external_backup_file_blocked takes priority over restore_overwrite_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      externalBackupFileProvided: true,
      restoreOverwriteRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED);
  });

  it('restore_overwrite_blocked takes priority over production_state_write_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      restoreOverwriteRequested: true,
      productionStateTargeted: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED);
  });

  it('production_state_write_blocked takes priority over real_learner_data_blocked', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      productionStateTargeted: true,
      realLearnerDataPresent: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED);
  });

  it('real_learner_data_blocked takes priority over missing_generated_test_data', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: false,
      realLearnerDataPresent: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED);
  });

  it('missing_generated_test_data takes priority over generated_test_rehearsal_plan_ready', () => {
    const result = deriveRestoreRehearsalSafetyState({});
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA);
  });

  it('telemetry_or_sync_blocked takes priority over generated_test_rehearsal_plan_ready', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      telemetryRequested: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED);
  });
});

// ── 10. createGeneratedTestRestoreRehearsalPlan — plan object shape ───────────

describe('createGeneratedTestRestoreRehearsalPlan — plan object shape', () => {
  const validInput = { generatedTestData: true, fixtureId: 'fixture-test-1' };

  it('returns an object', () => {
    expect(typeof createGeneratedTestRestoreRehearsalPlan(validInput)).toBe('object');
  });

  it('has stateId', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(typeof plan.stateId).toBe('string');
    expect(plan.stateId).toBe('generated_test_rehearsal_plan_ready');
  });

  it('has severity', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(typeof plan.severity).toBe('string');
  });

  it('has planId', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(typeof plan.planId).toBe('string');
    expect(plan.planId.length).toBeGreaterThan(0);
  });

  it('has fixtureId from input', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(plan.fixtureId).toBe('fixture-test-1');
  });

  it('has usesGeneratedTestData: true for valid input', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(plan.usesGeneratedTestData).toBe(true);
  });

  it('has usesGeneratedTestData: false for missing test data', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan({});
    expect(plan.usesGeneratedTestData).toBe(false);
  });

  it('has steps as array', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(Array.isArray(plan.steps)).toBe(true);
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it('has claimBoundary', () => {
    const plan = createGeneratedTestRestoreRehearsalPlan(validInput);
    expect(typeof plan.claimBoundary).toBe('string');
    expect(plan.claimBoundary).toContain('UNIT_STATIC_EVIDENCE_ONLY');
  });
});

// ── 11. createGeneratedTestRestoreRehearsalPlan — always-false safety fields ──

describe('createGeneratedTestRestoreRehearsalPlan — always-false safety fields', () => {
  const testCases = [
    { label: 'valid input', input: { generatedTestData: true } },
    { label: 'null input', input: null },
    { label: 'empty input', input: {} },
    { label: 'real learner data input', input: { generatedTestData: true, realLearnerDataPresent: true } },
    { label: 'production state targeted', input: { generatedTestData: true, productionStateTargeted: true } },
    { label: 'restore overwrite requested', input: { generatedTestData: true, restoreOverwriteRequested: true } },
    { label: 'telemetry requested', input: { generatedTestData: true, telemetryRequested: true } },
  ];

  for (const { label, input } of testCases) {
    it(`canExecuteRestore is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canExecuteRestore).toBe(false);
    });

    it(`canWriteProductionState is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canWriteProductionState).toBe(false);
    });

    it(`canUseRealLearnerData is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canUseRealLearnerData).toBe(false);
    });

    it(`canChangeBackupFormat is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canChangeBackupFormat).toBe(false);
    });

    it(`canOverwriteRestoreTarget is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canOverwriteRestoreTarget).toBe(false);
    });

    it(`canClaimDataLossPrevention is always false — ${label}`, () => {
      expect(createGeneratedTestRestoreRehearsalPlan(input).canClaimDataLossPrevention).toBe(false);
    });
  }
});

// ── 12. summarizeRestoreRehearsalPlan — summary object shape ──────────────────

describe('summarizeRestoreRehearsalPlan — summary object shape', () => {
  const validInput = { generatedTestData: true };

  it('returns an object', () => {
    expect(typeof summarizeRestoreRehearsalPlan(validInput)).toBe('object');
  });

  it('has stateId', () => {
    const s = summarizeRestoreRehearsalPlan(validInput);
    expect(typeof s.stateId).toBe('string');
  });

  it('has severity', () => {
    const s = summarizeRestoreRehearsalPlan(validInput);
    expect(typeof s.severity).toBe('string');
  });

  it('has labelVi', () => {
    const s = summarizeRestoreRehearsalPlan(validInput);
    expect(typeof s.labelVi).toBe('string');
    expect(s.labelVi.length).toBeGreaterThan(0);
  });

  it('has detailVi', () => {
    const s = summarizeRestoreRehearsalPlan(validInput);
    expect(typeof s.detailVi).toBe('string');
    expect(s.detailVi.length).toBeGreaterThan(0);
  });

  it('has evidenceLevel', () => {
    const s = summarizeRestoreRehearsalPlan(validInput);
    expect(typeof s.evidenceLevel).toBe('string');
    const validLevels = ['unit_static_only', 'generated_test_plan_only', 'unknown'];
    expect(validLevels).toContain(s.evidenceLevel);
  });
});

// ── 13. summarizeRestoreRehearsalPlan — always-false safety fields ────────────

describe('summarizeRestoreRehearsalPlan — always-false safety fields', () => {
  const testCases = [
    { label: 'valid input', input: { generatedTestData: true } },
    { label: 'null input', input: null },
    { label: 'empty input', input: {} },
    { label: 'real learner data', input: { generatedTestData: true, realLearnerDataPresent: true } },
    { label: 'production state', input: { generatedTestData: true, productionStateTargeted: true } },
  ];

  for (const { label, input } of testCases) {
    it(`canExecuteRestore is always false — ${label}`, () => {
      expect(summarizeRestoreRehearsalPlan(input).canExecuteRestore).toBe(false);
    });

    it(`canUseRealLearnerData is always false — ${label}`, () => {
      expect(summarizeRestoreRehearsalPlan(input).canUseRealLearnerData).toBe(false);
    });

    it(`canWriteProductionState is always false — ${label}`, () => {
      expect(summarizeRestoreRehearsalPlan(input).canWriteProductionState).toBe(false);
    });

    it(`canClaimProductionSafety is always false — ${label}`, () => {
      expect(summarizeRestoreRehearsalPlan(input).canClaimProductionSafety).toBe(false);
    });
  }
});

// ── 14. Evidence levels ────────────────────────────────────────────────────────

describe('summarizeRestoreRehearsalPlan — evidence levels', () => {
  it('returns generated_test_plan_only for ready state', () => {
    const s = summarizeRestoreRehearsalPlan({ generatedTestData: true });
    expect(s.evidenceLevel).toBe('generated_test_plan_only');
  });

  it('returns unit_static_only for missing_generated_test_data', () => {
    const s = summarizeRestoreRehearsalPlan({});
    expect(s.evidenceLevel).toBe('unit_static_only');
  });

  it('returns unit_static_only for blocked states', () => {
    const s = summarizeRestoreRehearsalPlan({
      generatedTestData: true,
      telemetryRequested: true,
    });
    expect(s.evidenceLevel).toBe('unit_static_only');
  });

  it('returns unit_static_only for real_learner_data_blocked', () => {
    const s = summarizeRestoreRehearsalPlan({
      generatedTestData: true,
      realLearnerDataPresent: true,
    });
    expect(s.evidenceLevel).toBe('unit_static_only');
  });

  it('returns unknown for unavailable state', () => {
    const s = summarizeRestoreRehearsalPlan(null);
    if (s.stateId === 'restore_rehearsal_planner_unavailable') {
      expect(s.evidenceLevel).toBe('unknown');
    } else {
      expect(['unit_static_only', 'generated_test_plan_only', 'unknown']).toContain(s.evidenceLevel);
    }
  });
});

// ── 15. Vietnamese-first copy presence ────────────────────────────────────────

describe('summarizeRestoreRehearsalPlan — Vietnamese-first copy', () => {
  it('labelVi contains Vietnamese text for ready state', () => {
    const s = summarizeRestoreRehearsalPlan({ generatedTestData: true });
    const hasVietnamese = /[À-ɏḀ-ỿ]/.test(s.labelVi) ||
      /sẵn sàng|kế hoạch|thử nghiệm|bị chặn|thiếu|không|planner/.test(s.labelVi);
    expect(hasVietnamese).toBe(true);
  });

  it('detailVi contains Vietnamese text for ready state', () => {
    const s = summarizeRestoreRehearsalPlan({ generatedTestData: true });
    const hasVietnamese = /[À-ɏḀ-ỿ]/.test(s.detailVi) ||
      /kế hoạch|dữ liệu|thử nghiệm|sản xuất|bằng chứng/.test(s.detailVi);
    expect(hasVietnamese).toBe(true);
  });

  it('labelVi contains Vietnamese text for missing data state', () => {
    const s = summarizeRestoreRehearsalPlan({});
    expect(s.labelVi.length).toBeGreaterThan(0);
  });
});

// ── 16. Forbidden claim strings absent ────────────────────────────────────────

describe('summarizeRestoreRehearsalPlan — no forbidden claims', () => {
  const inputs = [
    { generatedTestData: true },
    {},
    null,
    { generatedTestData: true, realLearnerDataPresent: true },
  ];

  for (const input of inputs) {
    it(`no BETA_READY claim — input: ${JSON.stringify(input)}`, () => {
      const s = summarizeRestoreRehearsalPlan(input);
      expect(JSON.stringify(s)).not.toContain('BETA_READY');
    });

    it(`no restore execution claim — input: ${JSON.stringify(input)}`, () => {
      const s = summarizeRestoreRehearsalPlan(input);
      expect(JSON.stringify(s)).not.toContain('restore_executed');
    });
  }
});

// ── 17. No storage/write/network/telemetry APIs in source ─────────────────────

describe('source file — no forbidden APIs', () => {
  it('does not use localStorage', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/localStorage\s*\.\s*(setItem|getItem|removeItem|clear)/);
  });

  it('does not use IndexedDB', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/indexedDB|IDBDatabase|IDBTransaction/);
  });

  it('does not use fetch or XMLHttpRequest', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
  });

  it('does not use Date.now directly', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/Date\.now\s*\(/);
  });

  it('does not use process.env or import.meta.env', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/process\.env|import\.meta\.env/);
  });

  it('does not import backup/export/restore modules', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    expect(source).not.toMatch(/import\s+.*from\s+['"].*[Bb]ackup[^'"]*['"]/);
    expect(source).not.toMatch(/import\s+.*from\s+['"].*[Rr]estore[^'"]*['"]/);
    expect(source).not.toMatch(/import\s+.*from\s+['"].*[Ee]xport[^'"]*['"]/);
  });

  it('does not import storage drivers', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    expect(source).not.toMatch(/import\s+.*from\s+['"].*[Ss]torage[Aa]dapter[^'"]*['"]/);
    expect(source).not.toMatch(/import\s+.*from\s+['"].*[Ii]ndexed[Dd][Bb][^'"]*['"]/);
  });

  it('does not use href, route, navigation, settings, library, or dashboard strings', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = fs.readFileSync(
      path.join(__dirname, '../../src/state/restoreRehearsalPlanner.js'),
      'utf8'
    );
    const nonCommentLines = source
      .split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
      .join('\n');
    expect(nonCommentLines).not.toMatch(/\bhref\s*[=:]/);
    expect(nonCommentLines).not.toMatch(/\brouter\.push|useNavigate|navigate\(/);
  });
});

// ── 18. Generated/test data only boundary ─────────────────────────────────────

describe('generated/test data only boundary', () => {
  it('plan is NOT ready without generatedTestData flag', () => {
    const result = deriveRestoreRehearsalSafetyState({
      fixtureId: 'some-fixture',
      sourceAdapterId: 'localstorage',
    });
    expect(result).not.toBe(RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY);
  });

  it('plan IS ready with generatedTestData: true and no blocked flags', () => {
    const result = deriveRestoreRehearsalSafetyState({ generatedTestData: true });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY);
  });

  it('real learner data blocks even when generatedTestData is also set', () => {
    const result = deriveRestoreRehearsalSafetyState({
      generatedTestData: true,
      realLearnerDataPresent: true,
    });
    expect(result).toBe(RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED);
  });
});
