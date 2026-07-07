export const SHIME_FORBIDDEN_KEYS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload',
  'cameraFrames',
  'audioRecording',
  'biometricIdentity'
]);

export function findSensitiveKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findSensitiveKeys(entry, `${path}[${index}]`, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  Object.entries(value).forEach(([key, entry]) => {
    const next = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (SHIME_FORBIDDEN_KEYS.includes(key)) found.push({ key, path: next });
    findSensitiveKeys(entry, next, found);
  });
  return found;
}

export function assertShimeEcosystemInvariants(output = {}) {
  const failures = [];
  if (findSensitiveKeys(output).length > 0) failures.push('sensitive_output');
  if (output.dryRunOnly === false) failures.push('not_dry_run');
  if (output.sendStatus && output.sendStatus !== 'not_sent') failures.push('send_status_not_safe');
  if (output.robotInterventionPlan?.sendStatus !== 'not_sent') failures.push('robot_send_status_not_safe');
  if (output.robotInterventionPlan?.suggestedMotionPolicy !== 'locked') failures.push('motion_not_locked');
  if (output.transportPlan?.opensConnection === true) failures.push('transport_opens_connection');
  if (output.timetablePlan?.mutatesSchedule === true) failures.push('schedule_mutation');
  if (output.timetablePlan?.scheduleMutationAllowed === true) failures.push('schedule_mutation_allowed');
  if (output.timetablePlan?.notificationAllowed === true) failures.push('notification_allowed');
  if (output.timetablePlan?.calendarMutationAllowed === true) failures.push('calendar_mutation_allowed');
  if (output.safetyDecision?.appAuthorityPreserved === false) failures.push('app_authority_not_preserved');
  if (output.safetyDecision?.fsrsSchedulerAuthorityPreserved === false) failures.push('fsrs_authority_not_preserved');
  if (output.safetyDecision?.safetyGovernorApplied === false) failures.push('safety_governor_not_applied');
  const reasons = output.reasonCodes || output.safetyDecision?.reasonCodes || output.robotInterventionPlan?.reasonCodes;
  if (!Array.isArray(reasons) || reasons.length === 0) failures.push('missing_reason_codes');
  if (output.learningCapsule?.privacyStatus && !['redacted_coarse_only', 'blocked'].includes(output.learningCapsule.privacyStatus)) failures.push('privacy_status_not_safe');
  return { ok: failures.length === 0, failures };
}
