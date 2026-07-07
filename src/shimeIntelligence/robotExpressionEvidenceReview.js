import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export const REQUIRED_EXPRESSION_CONTROL_ARTIFACTS = Object.freeze([
  'shime-fake-robot-console.json',
  'shime-expression-control-center-evidence.json',
  'shime-robot-expression-manual-qa.json',
  'shime-robot-expression-ui-privacy-audit.json'
]);

function artifact(name, artifacts) {
  return Object.prototype.hasOwnProperty.call(artifacts || {}, name) ? artifacts[name] : undefined;
}

function hasAny(value, predicate) {
  if (Array.isArray(value)) return value.some(entry => hasAny(entry, predicate));
  if (!value || typeof value !== 'object') return predicate(value);
  if (predicate(value)) return true;
  return Object.values(value).some(entry => hasAny(entry, predicate));
}

export function reviewRobotExpressionControlCenterEvidence(artifacts = {}) {
  const blockers = [];
  const warnings = [];
  const missingArtifacts = REQUIRED_EXPRESSION_CONTROL_ARTIFACTS.filter(name => artifact(name, artifacts) === undefined);
  if (missingArtifacts.length > 0) blockers.push(`missing_artifacts:${missingArtifacts.join(',')}`);
  const fakeConsole = artifact('shime-fake-robot-console.json', artifacts) || {};
  const evidence = artifact('shime-expression-control-center-evidence.json', artifacts) || {};
  const manualQa = artifact('shime-robot-expression-manual-qa.json', artifacts) || {};
  const privacy = artifact('shime-robot-expression-ui-privacy-audit.json', artifacts) || {};
  [fakeConsole, evidence, manualQa, privacy].forEach((entry, index) => {
    if (findSensitiveKeys(entry).length > 0) blockers.push(`sensitive_artifact:${index}`);
  });
  if (privacy.status !== 'PASS') blockers.push('privacy_audit_not_pass');
  if (fakeConsole.dryRunOnly !== true || fakeConsole.sendStatus !== 'not_sent') blockers.push('fake_console_not_dry_run');
  if (evidence.dryRunOnly !== true || evidence.sendStatus !== 'not_sent') blockers.push('control_center_evidence_not_dry_run');
  if (hasAny(evidence, entry => entry?.motionPolicy === 'unlocked')) blockers.push('motion_unlocked');
  if (hasAny(evidence, entry => entry?.sendStatus && entry.sendStatus !== 'not_sent')) blockers.push('send_status_not_safe');
  if (manualQa.itemCount && manualQa.itemCount < 10) warnings.push('manual_qa_checklist_short');
  return {
    overallStatus: blockers.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS',
    blockers,
    warnings,
    artifactSummary: {
      requiredCount: REQUIRED_EXPRESSION_CONTROL_ARTIFACTS.length,
      presentCount: REQUIRED_EXPRESSION_CONTROL_ARTIFACTS.length - missingArtifacts.length,
      missingArtifacts
    },
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['robot_expression_evidence_review_completed']
  };
}
