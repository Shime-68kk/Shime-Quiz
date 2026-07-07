const SCORE_PASS = 70;

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function bucket(score) {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

export function scoreCompanionBehavior(auditEntries = [], options = {}) {
  const entries = Array.isArray(auditEntries) ? auditEntries : [];
  const serialized = JSON.stringify(entries);
  const sensitive = ['prompt', 'correctAnswer', 'userAnswer', 'sourceMetadata', 'backupPayload', 'rawQuizPayload'].some(key => serialized.includes(key));
  const blocked = entries.filter(entry => entry.privacyStatus === 'blocked').length;
  const repeated = entries.filter((entry, index) => {
    if (index <= 0) return false;
    if (entry.finalRobotIntent !== entries[index - 1].finalRobotIntent) return false;
    return !['neutral'].includes(entry.finalRobotIntent);
  }).length;
  const rateLimited = entries.filter(entry => entry.reasonCodes?.includes('behavior_rate_limited')).length;
  const unsafe = entries.filter(entry => {
    if (entry.reasonCodes?.includes('transport_unsafe') && entry.finalRobotIntent === 'neutral') return false;
    return entry.safetyDecision === 'blocked' && entry.finalRobotIntent !== 'neutral';
  }).length;
  const dryRunFailure = entries.some(entry => entry.dryRunOnly !== true);

  const privacyScore = sensitive ? 0 : blocked > 0 ? 80 : 100;
  const safetyScore = clamp(100 - unsafe * 15);
  const nonSpamScore = clamp(100 - repeated * 6 - rateLimited * 8);
  const calmnessScore = clamp(100 - entries.filter(entry => String(entry.policyIntent || '').includes('big')).length * 20);
  const helpfulnessScore = clamp(75 + entries.filter(entry => ['encourage', 'focus_gently', 'recovery_praise', 'review_reminder'].includes(entry.policyIntent)).length * 5);
  const determinismScore = 100;
  const robotSafetyScore = dryRunFailure ? 0 : 100;
  const premiumFeelScore = clamp((calmnessScore + helpfulnessScore + nonSpamScore) / 3);
  const average = Math.round((privacyScore + safetyScore + calmnessScore + helpfulnessScore + nonSpamScore + determinismScore + robotSafetyScore + premiumFeelScore) / 8);
  const failureReasons = [];
  if (sensitive) failureReasons.push('sensitive_payload_leaked');
  if (dryRunFailure) failureReasons.push('robot_send_not_dry_run');
  if (safetyScore < SCORE_PASS) failureReasons.push('safety_score_low');
  if (nonSpamScore < SCORE_PASS) failureReasons.push('non_spam_score_low');

  return {
    scores: {
      privacyScore,
      safetyScore,
      calmnessScore,
      helpfulnessScore,
      nonSpamScore,
      determinismScore,
      robotSafetyScore,
      premiumFeelScore,
      average
    },
    buckets: {
      privacy: bucket(privacyScore),
      safety: bucket(safetyScore),
      nonSpam: bucket(nonSpamScore),
      premiumFeel: bucket(premiumFeelScore),
      overall: bucket(average)
    },
    failureReasons,
    recommendation: failureReasons.length ? 'review_required' : 'pass',
    passed: failureReasons.length === 0 && average >= (options.threshold || SCORE_PASS)
  };
}
