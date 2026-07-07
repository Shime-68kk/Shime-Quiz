import { validateRobotExpressionEnvelope } from './robotExpressionEnvelopeProtocol.js';
import { validateEsp32ExpressionLogPreview } from './esp32ExpressionLogContract.js';
import { summarizeFakeExpressionTransportTranscript } from './fakeExpressionTransportTranscript.js';

export const REQUIRED_PROTOCOL_REVIEW_ARTIFACTS = Object.freeze([
  'shime-expression-protocol-pipeline.json',
  'shime-expression-protocol-benchmark.json',
  'shime-esp32-expression-log-contract.json',
  'shime-expression-protocol-evidence.json',
  'shime-expression-envelope-golden.json'
]);

export function reviewExpressionProtocolArtifacts(artifacts = {}) {
  const blockers = [];
  const warnings = [];
  REQUIRED_PROTOCOL_REVIEW_ARTIFACTS.forEach(name => {
    if (!artifacts[name]) blockers.push(`missing_artifact:${name}`);
  });
  const pipeline = artifacts['shime-expression-protocol-pipeline.json'] || {};
  const benchmark = artifacts['shime-expression-protocol-benchmark.json'] || {};
  const logPreview = artifacts['shime-esp32-expression-log-contract.json'] || {};
  const golden = artifacts['shime-expression-envelope-golden.json'] || {};
  const envelopeValidation = validateRobotExpressionEnvelope(golden);
  const logValidation = validateEsp32ExpressionLogPreview(logPreview);
  const transcriptSummary = summarizeFakeExpressionTransportTranscript(pipeline.fakeTransportTranscript || {});

  if (!envelopeValidation.ok) blockers.push('golden_envelope_invalid');
  if (!logValidation.ok || logPreview.accepted !== true) blockers.push('log_only_preview_invalid');
  if ((benchmark.protocolScenarioCount || 0) < 30000) blockers.push('protocol_scenario_count_low');
  if ((benchmark.attackScenarioCount || 0) < 3000) blockers.push('attack_scenario_count_low');
  if (benchmark.passed !== true) blockers.push('benchmark_not_passed');
  if (transcriptSummary.lastAckStatus !== 'accepted_dry_run') blockers.push('fake_transcript_missing_acceptance');
  if (golden.dryRunOnly !== true) blockers.push('golden_not_dry_run');
  if (golden.sendStatus !== 'not_sent') blockers.push('golden_send_status_not_safe');
  if (golden.motionPolicy !== 'locked') blockers.push('golden_motion_not_locked');
  if (!Array.isArray(golden.reasonCodes) || golden.reasonCodes.length === 0) blockers.push('golden_missing_reason_codes');
  if (!pipeline.safetyResult?.ok) blockers.push('pipeline_safety_not_ok');
  if (!pipeline.privacyResult?.ok) warnings.push('pipeline_privacy_not_explicit_ok');

  return {
    reviewVersion: 'shime-expression-protocol-review-v1',
    overallStatus: blockers.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS',
    blockers,
    warnings,
    artifactSummary: {
      requiredCount: REQUIRED_PROTOCOL_REVIEW_ARTIFACTS.length,
      presentCount: REQUIRED_PROTOCOL_REVIEW_ARTIFACTS.filter(name => artifacts[name]).length
    },
    protocolSummary: {
      protocolVersion: golden.protocolVersion || 'missing',
      messageType: golden.messageType || 'missing',
      benchmarkScenarios: benchmark.protocolScenarioCount || 0,
      attackScenarios: benchmark.attackScenarioCount || 0
    },
    safetySummary: {
      dryRunOnly: golden.dryRunOnly === true,
      sendStatus: golden.sendStatus || 'missing',
      motionPolicy: golden.motionPolicy || 'missing',
      fakeTranscriptAck: transcriptSummary.lastAckStatus,
      logOnlyAccepted: logPreview.accepted === true
    },
    privacySummary: {
      privacyStatus: golden.privacyStatus || 'missing',
      noSensitiveArtifactClaims: true
    },
    compatibilitySummary: {
      envelopeAndLogAgree: golden.expressionFamily === logPreview.expressionFamily,
      contractVersion: golden.expressionContractVersion || 'missing'
    },
    recommendation: blockers.length > 0 ? 'MORE_PROTOCOL_HARDENING_REQUIRED' : 'READY_FOR_LOG_ONLY_FIRMWARE_PLANNING_REVIEW',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['expression_protocol_artifacts_reviewed']
  };
}

