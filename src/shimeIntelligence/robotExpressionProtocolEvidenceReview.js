import { validateRobotExpressionEnvelope } from './robotExpressionEnvelopeProtocol.js';
import { validateEsp32ExpressionLogPreview } from './esp32ExpressionLogContract.js';
import { summarizeFakeExpressionTransportTranscript } from './fakeExpressionTransportTranscript.js';

export const REQUIRED_EXPRESSION_PROTOCOL_ARTIFACTS = Object.freeze([
  'shime-expression-protocol-pipeline.json',
  'shime-expression-protocol-benchmark.json',
  'shime-esp32-expression-log-contract.json',
  'shime-expression-protocol-evidence.json',
  'shime-expression-protocol-manual-qa.json',
  'shime-expression-envelope-golden.json'
]);

export function reviewRobotExpressionProtocolEvidence(artifacts = {}) {
  const failures = [];
  REQUIRED_EXPRESSION_PROTOCOL_ARTIFACTS.forEach(name => {
    if (!artifacts[name]) failures.push(`missing_artifact:${name}`);
  });
  const benchmark = artifacts['shime-expression-protocol-benchmark.json'] || {};
  if ((benchmark.protocolScenarioCount || 0) < 30000) failures.push('protocol_scenario_count_too_low');
  if ((benchmark.attackScenarioCount || 0) < 3000) failures.push('attack_scenario_count_too_low');
  if (benchmark.passed !== true) failures.push('benchmark_not_passed');
  const golden = artifacts['shime-expression-envelope-golden.json'] || {};
  const goldenValidation = validateRobotExpressionEnvelope(golden);
  if (!goldenValidation.ok) failures.push('golden_envelope_invalid');
  if (golden.dryRunOnly !== true) failures.push('golden_not_dry_run');
  if (golden.sendStatus !== 'not_sent') failures.push('golden_send_status_not_safe');
  if (golden.motionPolicy !== 'locked') failures.push('golden_motion_not_locked');
  const pipeline = artifacts['shime-expression-protocol-pipeline.json'] || {};
  const transcriptSummary = summarizeFakeExpressionTransportTranscript(pipeline.fakeTransportTranscript || {});
  if (transcriptSummary.lastAckStatus !== 'accepted_dry_run') failures.push('fake_transcript_not_accepted');
  const logPreview = artifacts['shime-esp32-expression-log-contract.json'] || {};
  const logValidation = validateEsp32ExpressionLogPreview(logPreview);
  if (!logValidation.ok || logPreview.accepted !== true) failures.push('esp32_log_preview_invalid');
  return {
    reviewVersion: 'shime-expression-protocol-evidence-review-v1',
    ok: failures.length === 0,
    failures,
    artifactCount: Object.keys(artifacts).length,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['robot_expression_protocol_evidence_review_completed']
  };
}

