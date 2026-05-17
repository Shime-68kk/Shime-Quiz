/**
 * tests/unit/limitedLocalBackendPilot.test.js
 *
 * Phase 18E limited local backend pilot tests.
 * All coverage stays in the test-only helper and synthetic in-memory backend.
 */

import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  PHASE18E_IDENTITY,
  PHASE18E_CLAIM_BOUNDARY,
  PHASE18E_PILOT_FAMILY,
  PHASE18E_ALLOWED_FAMILIES,
  PHASE18E_MANIFEST_ID,
  PHASE18E_SOURCE_KEY,
  PHASE18E_TARGET_STORE,
  PHASE18E_RISK_CLASS,
  PHASE18E_OPERATION_TYPE,
  PHASE18E_BACKEND_KIND,
  PHASE18E_CANONICAL_SOURCE,
  ALLOWED_MODES_PHASE18E,
  REQUIRED_MANIFEST_FIELDS,
  REQUIRED_PILOT_RESULT_FIELDS,
  FAILURE_CODES,
  syntheticChecksum,
  createLimitedLocalBackendPilot,
  createSyntheticLocalBackend,
  validateBackendPilotPreflight,
  captureBackendPilotSnapshot,
  prepareBackendWriteGate,
  commitSyntheticBackendWrite,
  verifyBackendWriteGate,
  prepareRollbackGate,
  executeSyntheticRollback,
  verifyRollbackGate,
  runLimitedLocalBackendPilot,
  simulateBackendPilotFailure,
} from './helpers/limitedLocalBackendPilot.js';

const helperPath = new URL('./helpers/limitedLocalBackendPilot.js', import.meta.url);

const sourcePayload = Object.freeze({
  dataFamily: 'recommendation-feedback',
  synthetic: true,
  items: Object.freeze([
    Object.freeze({ cardId: 'synthetic-card-001', rating: 'helpful', dateKey: '2026-05-17' }),
  ]),
});

function manifest(overrides = {}) {
  const result = createLimitedLocalBackendPilot(overrides);
  if (!result.ok) throw new Error(`manifest failed: ${result.error}`);
  return result.entry;
}

function backend(overrides = {}) {
  const result = createSyntheticLocalBackend(overrides);
  if (!result.ok) throw new Error(`backend failed: ${result.error}`);
  return result.backend;
}

function deterministicPilotId(entry) {
  return `pilot-phase18e-test-${entry.manifestId}`;
}

function runPilot(overrides = {}) {
  return runLimitedLocalBackendPilot({
    mode: 'test',
    testOnlyGate: true,
    manifestEntry: manifest(),
    sourcePayload,
    backend: backend(),
    idProvider: deterministicPilotId,
    ...overrides,
  });
}

function nonCommentHelperSource() {
  return fs.readFileSync(helperPath, 'utf8')
    .split(/\r?\n/)
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
}

describe('Phase 18E limited local backend pilot manifest', () => {
  it('creates a limited backend pilot for recommendation-feedback', () => {
    const result = createLimitedLocalBackendPilot();
    expect(result.ok).toBe(true);
    expect(result.entry.dataFamily).toBe('recommendation-feedback');
    expect(result.entry.manifestId).toBe(PHASE18E_MANIFEST_ID);
    expect(result.entry.sourceKey).toBe(PHASE18E_SOURCE_KEY);
    expect(result.entry.targetStore).toBe(PHASE18E_TARGET_STORE);
  });

  it('contains the required manifest fields and constants', () => {
    const entry = manifest();
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      expect(entry).toHaveProperty(field);
    }
    expect(entry.riskClass).toBe(PHASE18E_RISK_CLASS);
    expect(entry.operationType).toBe(PHASE18E_OPERATION_TYPE);
    expect(entry.backendKind).toBe(PHASE18E_BACKEND_KIND);
  });

  it('rejects non-recommendation-feedback families', () => {
    for (const dataFamily of ['study-history', 'fsrs-metadata', 'library-data', 'backup-data']) {
      const result = createLimitedLocalBackendPilot({ dataFamily });
      expect(result.ok).toBe(false);
      expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
    }
  });

  it('declares recommendation-feedback as the only allowed family', () => {
    expect(PHASE18E_PILOT_FAMILY).toBe('recommendation-feedback');
    expect(PHASE18E_ALLOWED_FAMILIES).toEqual(['recommendation-feedback']);
  });

  it('freezes the manifest entry', () => {
    expect(Object.isFrozen(manifest())).toBe(true);
  });
});

describe('Phase 18E preflight gate', () => {
  it('accepts test and internal-test-only modes', () => {
    for (const mode of ALLOWED_MODES_PHASE18E) {
      const result = validateBackendPilotPreflight({
        mode,
        testOnlyGate: true,
        manifestEntry: manifest(),
        sourcePayload,
        backend: backend(),
      });
      expect(result.ok).toBe(true);
      expect(result.checks).toContain('mode_allowed');
    }
  });

  it('rejects missing internal/test-only gate', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      manifestEntry: manifest(),
      sourcePayload,
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('rejects a false internal/test-only gate', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      testOnlyGate: false,
      manifestEntry: manifest(),
      sourcePayload,
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('rejects live and production modes', () => {
    for (const mode of ['live', 'production']) {
      const result = validateBackendPilotPreflight({
        mode,
        testOnlyGate: true,
        manifestEntry: manifest(),
        sourcePayload,
        backend: backend(),
      });
      expect(result.ok).toBe(false);
      expect(result.error).toBe(FAILURE_CODES.LIVE_MODE_REJECTED);
    }
  });

  it('requires a synthetic source payload', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      testOnlyGate: true,
      manifestEntry: manifest(),
      sourcePayload: null,
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_SOURCE_PAYLOAD);
  });

  it('rejects non-object source payloads', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      testOnlyGate: true,
      manifestEntry: manifest(),
      sourcePayload: 'not-synthetic-object',
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.INVALID_SOURCE_PAYLOAD);
  });

  it('requires a synthetic backend', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      testOnlyGate: true,
      manifestEntry: manifest(),
      sourcePayload,
      backend: { kind: 'real', isReal: true },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.INVALID_BACKEND_KIND);
  });

  it('rejects missing backend', () => {
    const result = validateBackendPilotPreflight({
      mode: 'test',
      testOnlyGate: true,
      manifestEntry: manifest(),
      sourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_BACKEND);
  });
});

describe('Phase 18E synthetic backend model', () => {
  it('creates a synthetic local backend only', () => {
    const result = createSyntheticLocalBackend();
    expect(result.ok).toBe(true);
    expect(result.backend.kind).toBe('synthetic');
    expect(result.backend.isReal).toBe(false);
    expect(result.backend.isProduction).toBe(false);
  });

  it('rejects non-synthetic backend creation', () => {
    const result = createSyntheticLocalBackend({ backendKind: 'real-indexed-store' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.INVALID_BACKEND_KIND);
  });

  it('keeps canonical metadata on the original source', () => {
    const entry = manifest();
    const result = runPilot({ manifestEntry: entry });
    expect(entry.canonicalSource).toBe(PHASE18E_CANONICAL_SOURCE);
    expect(result.canonicalSource).toBe(PHASE18E_CANONICAL_SOURCE);
    expect(result.snapshot.canonicalSource).toBe(PHASE18E_CANONICAL_SOURCE);
  });

  it('represents backup/export unchanged in metadata', () => {
    const result = runPilot();
    expect(result.backupExportUnchanged).toBe(true);
    expect(result.snapshot.backupExportUnchanged).toBe(true);
    expect(result.manifestEntry.backupExportUnchanged).toBe(true);
  });

  it('represents restore unchanged in metadata', () => {
    const result = runPilot();
    expect(result.restoreUnchanged).toBe(true);
    expect(result.snapshot.restoreUnchanged).toBe(true);
    expect(result.manifestEntry.restoreUnchanged).toBe(true);
  });

  it('does not leave data in the synthetic backend after rollback completion', () => {
    const syntheticBackend = backend();
    const result = runPilot({ backend: syntheticBackend });
    expect(result.ok).toBe(true);
    expect(syntheticBackend.has(PHASE18E_TARGET_STORE)).toBe(false);
  });
});

describe('Phase 18E storage and import boundaries', () => {
  it('does not import production storage registry or app runtime', () => {
    const source = nonCommentHelperSource();
    const registryTerm = ['storage', 'Adapter', 'Registry'].join('');
    const srcRuntimeTerm = ['/', 'src', '/'].join('');
    const appRuntimeTerm = ['src', '/', 'main'].join('');
    expect(source).not.toContain(registryTerm);
    expect(source).not.toContain(srcRuntimeTerm);
    expect(source).not.toContain(appRuntimeTerm);
  });

  it('does not reference real browser storage globals in executable helper code', () => {
    const source = nonCommentHelperSource();
    const localGlobal = ['window', 'localStorage'].join('.');
    const globalLocal = ['globalThis', 'localStorage'].join('.');
    const indexedGlobal = ['window', 'indexedDB'].join('.');
    const globalIndexed = ['globalThis', 'indexedDB'].join('.');
    expect(source).not.toContain(localGlobal);
    expect(source).not.toContain(globalLocal);
    expect(source).not.toContain(indexedGlobal);
    expect(source).not.toContain(globalIndexed);
  });

  it('does not use delete operations against the canonical production source', () => {
    const source = nonCommentHelperSource();
    const forbiddenDelete = ['localStorage', '.', 'removeItem'].join('');
    const forbiddenClear = ['localStorage', '.', 'clear'].join('');
    expect(source).not.toContain(forbiddenDelete);
    expect(source).not.toContain(forbiddenClear);
  });

  it('does not expose production app boot or settings UI hooks', () => {
    const source = nonCommentHelperSource();
    const bootTerm = ['app', ' ', 'boot', ' ', 'migration'].join('');
    const settingsTerm = ['Settings', 'UI'].join(' ');
    expect(source).not.toContain(bootTerm);
    expect(source).not.toContain(settingsTerm);
  });
});

describe('Phase 18E lifecycle ordering', () => {
  it('captures snapshot before write gate', () => {
    const entry = manifest();
    const syntheticBackend = backend();
    const snapshotResult = captureBackendPilotSnapshot({ manifestEntry: entry, sourcePayload });
    expect(snapshotResult.ok).toBe(true);
    const gateResult = prepareBackendWriteGate({
      manifestEntry: entry,
      snapshot: snapshotResult.snapshot,
      backend: syntheticBackend,
    });
    expect(gateResult.ok).toBe(true);
    expect(gateResult.writeGate.snapshotRef).toBe(snapshotResult.snapshot.snapshotId);
  });

  it('requires snapshot before write gate', () => {
    const result = prepareBackendWriteGate({
      manifestEntry: manifest(),
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_GATE_FAILED);
  });

  it('requires write gate before target commit', () => {
    const entry = manifest();
    const snapshotResult = captureBackendPilotSnapshot({ manifestEntry: entry, sourcePayload });
    const result = commitSyntheticBackendWrite({
      manifestEntry: entry,
      sourcePayload,
      snapshot: snapshotResult.snapshot,
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.BACKEND_COMMIT_FAILED);
  });

  it('commits only after the write gate passes', () => {
    const entry = manifest();
    const syntheticBackend = backend();
    const snapshotResult = captureBackendPilotSnapshot({ manifestEntry: entry, sourcePayload });
    const gateResult = prepareBackendWriteGate({
      manifestEntry: entry,
      snapshot: snapshotResult.snapshot,
      backend: syntheticBackend,
    });
    const commitResult = commitSyntheticBackendWrite({
      manifestEntry: entry,
      sourcePayload,
      snapshot: snapshotResult.snapshot,
      writeGate: gateResult.writeGate,
      backend: syntheticBackend,
    });
    expect(commitResult.ok).toBe(true);
    expect(syntheticBackend.has(entry.targetStore)).toBe(true);
  });

  it('requires write verification before rollback gate', () => {
    const entry = manifest();
    const snapshotResult = captureBackendPilotSnapshot({ manifestEntry: entry, sourcePayload });
    const result = prepareRollbackGate({
      manifestEntry: entry,
      snapshot: snapshotResult.snapshot,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_GATE_FAILED);
  });

  it('requires rollback gate before rollback execution', () => {
    const entry = manifest();
    const snapshotResult = captureBackendPilotSnapshot({ manifestEntry: entry, sourcePayload });
    const result = executeSyntheticRollback({
      manifestEntry: entry,
      snapshot: snapshotResult.snapshot,
      backend: backend(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_FAILED);
  });

  it('requires rollback verification before completion', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
    expect(result.rollbackGate.passed).toBe(true);
    expect(result.rollbackVerification.verified).toBe(true);
    expect(result.failureCode).toBe(null);
  });
});

describe('Phase 18E verification and failure codes', () => {
  it('verifies backend write checksums', () => {
    const entry = manifest();
    const verification = verifyBackendWriteGate({
      manifestEntry: entry,
      commitResult: {
        backendChecksum: syntheticChecksum('backend', entry.targetStore),
      },
    });
    expect(verification.ok).toBe(true);
    expect(verification.writeVerification.verified).toBe(true);
  });

  it('fails write verification with an explicit code', () => {
    const result = verifyBackendWriteGate({
      manifestEntry: manifest(),
      commitResult: { backendChecksum: 'wrong-checksum' },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_VERIFICATION_FAILED);
  });

  it('fails rollback gate with an explicit code', () => {
    const result = prepareRollbackGate({
      manifestEntry: manifest(),
      snapshot: { snapshotId: 'snap' },
      writeVerification: { verified: false },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_GATE_FAILED);
  });

  it('fails rollback verification with an explicit code', () => {
    const result = verifyRollbackGate({
      manifestEntry: manifest(),
      rollbackResult: { restoredChecksum: 'wrong-checksum' },
      sourceChecksum: syntheticChecksum('source', PHASE18E_SOURCE_KEY),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_CHECKSUM_MISMATCH);
  });

  it('returns explicit failure code on preflight failure', () => {
    const result = runPilot({ testOnlyGate: false });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
    expect(result.preflight).toBe(null);
  });

  it('stop-on-failure prevents later steps', () => {
    const result = runPilot({ backend: { kind: 'real', isReal: true } });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.INVALID_BACKEND_KIND);
    expect(result.snapshot).toBeUndefined();
    expect(result.writeGate).toBeUndefined();
    expect(result.rollbackGate).toBeUndefined();
  });

  it('simulates explicit failure codes for all lifecycle steps', () => {
    const cases = [
      ['preflight', FAILURE_CODES.PREFLIGHT_FAILED],
      ['snapshot', FAILURE_CODES.SNAPSHOT_FAILED],
      ['write-gate', FAILURE_CODES.WRITE_GATE_FAILED],
      ['backend-commit', FAILURE_CODES.BACKEND_COMMIT_FAILED],
      ['write-verification', FAILURE_CODES.WRITE_VERIFICATION_FAILED],
      ['rollback-gate', FAILURE_CODES.ROLLBACK_GATE_FAILED],
      ['rollback', FAILURE_CODES.ROLLBACK_FAILED],
      ['rollback-verification', FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED],
    ];
    for (const [failAtStep, errorCode] of cases) {
      const result = simulateBackendPilotFailure({
        mode: 'test',
        testOnlyGate: true,
        manifestEntry: manifest(),
        failAtStep,
        errorCode,
      });
      expect(result.ok).toBe(false);
      expect(result.failureCode).toBe(errorCode);
      expect(result.stoppedAtStep).toBe(failAtStep);
    }
  });
});

describe('Phase 18E deterministic result and mutation boundaries', () => {
  it('returns deterministic output with injected idProvider', () => {
    const first = runPilot();
    const second = runPilot();
    expect(first.pilotId).toBe(`pilot-phase18e-test-${PHASE18E_MANIFEST_ID}`);
    expect(second.pilotId).toBe(first.pilotId);
    expect(second.sourceChecksum).toBe(first.sourceChecksum);
    expect(second.backendChecksum).toBe(first.backendChecksum);
    expect(second.restoredChecksum).toBe(first.restoredChecksum);
  });

  it('includes all required pilot result fields', () => {
    const result = runPilot();
    for (const field of REQUIRED_PILOT_RESULT_FIELDS) {
      expect(result).toHaveProperty(field);
    }
  });

  it('does not mutate input payload', () => {
    const mutablePayload = {
      dataFamily: 'recommendation-feedback',
      synthetic: true,
      nested: { count: 1 },
    };
    const before = JSON.stringify(mutablePayload);
    const result = runPilot({ sourcePayload: mutablePayload });
    expect(result.ok).toBe(true);
    expect(JSON.stringify(mutablePayload)).toBe(before);
  });

  it('does not mutate manifest', () => {
    const entry = manifest();
    const before = JSON.stringify(entry);
    const result = runPilot({ manifestEntry: entry });
    expect(result.ok).toBe(true);
    expect(JSON.stringify(entry)).toBe(before);
  });

  it('freezes the successful result object', () => {
    const result = runPilot();
    expect(Object.isFrozen(result)).toBe(true);
  });
});

describe('Phase 18E claim boundary', () => {
  it('states internal/test-only and no production behavior', () => {
    const result = runPilot();
    expect(PHASE18E_IDENTITY).toContain('Phase 18E');
    expect(result.internalPilotOnly).toBe(true);
    expect(result.claimBoundary).toBe(PHASE18E_CLAIM_BOUNDARY);
    expect(result.claimBoundary).toContain('internal/test-only');
    expect(result.claimBoundary).toContain('synthetic data only');
    expect(result.claimBoundary).toContain('no production behavior change');
  });

  it('states no production storage switch and no deletion of canonical data', () => {
    const result = runPilot();
    expect(result.claimBoundary).toContain('no production registry switch');
    expect(result.claimBoundary).toContain('no production IndexedDBAdapter');
    expect(result.claimBoundary).toContain('no localStorage deletion');
  });
}
);
