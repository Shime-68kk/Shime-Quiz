import { runSafeCapsuleRehearsalScenario } from './safeCapsuleRehearsalLabModel.js';
import {
  createManualSafeCapsuleHandoffPack,
  createSafeExportFileName,
  serializeManualHandoffJsonl,
  verifyManualSafeCapsuleHandoffPack
} from '../../deviceBridge/safeCapsuleManualExportPackage.js';

export const SAFE_CAPSULE_EXPORT_VAULT_ACTIONS = Object.freeze({
  ADD_SCENARIO: 'add_scenario',
  ADD_ALL_SAFE: 'add_all_safe',
  REJECT_ADVERSARIAL: 'reject_adversarial',
  BUILD_HANDOFF: 'build_handoff',
  VERIFY_HANDOFF: 'verify_handoff',
  CLEAR: 'clear',
  MARK_COPIED: 'mark_copied',
  MARK_DOWNLOADED: 'mark_downloaded'
});

const SAFE_SCENARIOS = ['steady_progress', 'struggling_streak', 'review_pressure_high', 'low_energy_focus'];

export function createInitialSafeCapsuleExportVaultState() {
  return {
    exportMode: 'manual_mock_only',
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    browserPersistenceEnabled: false,
    noSendStatus: 'manual_handoff_no_send',
    noConnectionStatus: 'mock_only_not_connected',
    packages: [],
    evidence: [],
    rejected: [],
    handoffPack: null,
    manifestPreview: null,
    verificationResult: null,
    packageCount: 0,
    evidenceCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    lastVerificationStatus: 'not_verified',
    lastFileName: null,
    lastJsonlPreviewSafe: '',
    copyReady: false,
    downloadReady: false,
    copied: false,
    downloaded: false
  };
}

function summarize(state) {
  return {
    ...state,
    packageCount: state.packages.length,
    evidenceCount: state.evidence.length,
    acceptedCount: state.packages.length,
    rejectedCount: state.rejected.length
  };
}

function addScenario(state, scenarioId) {
  const result = runSafeCapsuleRehearsalScenario(scenarioId);
  if (!result.accepted || !result.mockPackage) {
    return summarize({
      ...state,
      rejected: [...state.rejected, {
        scenarioId,
        rejected: true,
        rejectionReasonCode: result.rejectionReasonCode || 'REJECTED_UNSAFE_SCENARIO'
      }]
    });
  }
  return summarize({
    ...state,
    packages: [...state.packages, result.mockPackage],
    evidence: [...state.evidence, result.privacyEvidenceSummary],
    handoffPack: null,
    manifestPreview: null,
    verificationResult: null,
    lastVerificationStatus: 'not_verified',
    copyReady: false,
    downloadReady: false
  });
}

function buildHandoff(state) {
  const created = createManualSafeCapsuleHandoffPack(state.packages, {
    createdAtBucket: '2026-07-08',
    exportId: 'manual_handoff_all_safe',
    privacyEvidence: state.evidence
  });
  if (!created.ok) {
    return summarize({
      ...state,
      verificationResult: { ok: false, issues: created.issues },
      lastVerificationStatus: 'blocked',
      copyReady: false,
      downloadReady: false
    });
  }
  const jsonl = serializeManualHandoffJsonl(created.handoffPack);
  return summarize({
    ...state,
    handoffPack: created.handoffPack,
    manifestPreview: created.handoffPack.manifest,
    verificationResult: created.handoffPack.verification,
    lastVerificationStatus: created.handoffPack.verification.ok ? 'valid' : 'invalid',
    lastFileName: createSafeExportFileName(created.handoffPack),
    lastJsonlPreviewSafe: jsonl.slice(0, 1600),
    copyReady: created.handoffPack.verification.ok,
    downloadReady: created.handoffPack.verification.ok
  });
}

export function applySafeCapsuleExportVaultAction(state, action) {
  const current = state || createInitialSafeCapsuleExportVaultState();
  const type = action?.type || action;
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.CLEAR) return createInitialSafeCapsuleExportVaultState();
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_SCENARIO) return addScenario(current, action.scenarioId);
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_ALL_SAFE) {
    return SAFE_SCENARIOS.reduce((next, scenarioId) => addScenario(next, scenarioId), current);
  }
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.REJECT_ADVERSARIAL) return addScenario(current, 'privacy_attack_raw_quiz');
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.BUILD_HANDOFF) return buildHandoff(current);
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.VERIFY_HANDOFF) {
    if (!current.handoffPack) return current;
    const verification = verifyManualSafeCapsuleHandoffPack(current.handoffPack);
    return { ...current, verificationResult: verification, lastVerificationStatus: verification.ok ? 'valid' : 'invalid' };
  }
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_COPIED) return { ...current, copied: true };
  if (type === SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_DOWNLOADED) return { ...current, downloaded: true };
  return current;
}

export function getSafeCapsuleExportVaultSafeScenarios() {
  return SAFE_SCENARIOS;
}
