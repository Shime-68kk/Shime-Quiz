import { runCompanionReplayScenario } from './companionReplayBenchmark.js';

export const COMPANION_V2_REQUIRED_COVERAGE_CLASSES = Object.freeze([
  'focus',
  'encourage',
  'celebrate_small',
  'celebrate_big',
  'suggest_break',
  'review_reminder',
  'reconnect_hint',
  'calm_error',
  'neutral_wait',
  'recovery_praise',
  'steady_progress',
  'privacy_block',
  'transport_block',
  'classroom_safe_downgrade',
  'repeated_event_spam',
  'sensitive_attack',
  'malformed_event',
  'disconnected',
  'high_accuracy_completion',
  'low_accuracy_completion'
]);

function classifyScenario(scenario, result) {
  const classes = new Set(scenario.expectedTags || []);
  const intents = (result.audit || []).map(entry => entry.policyIntent);
  const reasons = (result.audit || []).flatMap(entry => entry.reasonCodes || []);
  const name = `${scenario.name || ''} ${scenario.kind || ''}`.toLowerCase();

  intents.forEach(intent => {
    if (COMPANION_V2_REQUIRED_COVERAGE_CLASSES.includes(intent)) classes.add(intent);
  });
  if (intents.includes('focus_gently')) classes.add('focus');
  if (intents.includes('encourage')) classes.add('encourage');
  if (intents.includes('neutral_wait') || result.finalCommand === 'neutral') classes.add('neutral_wait');
  if (reasons.includes('forbidden_companion_key') || result.privacyResult === 'pass' && name.includes('sensitive')) classes.add('privacy_block');
  if (reasons.includes('transport_unsafe')) classes.add('transport_block');
  if (reasons.includes('classroom_safe_conservative')) classes.add('classroom_safe_downgrade');
  if (reasons.includes('behavior_rate_limited') || name.includes('spam')) classes.add('repeated_event_spam');
  if (name.includes('sensitive')) classes.add('sensitive_attack');
  if (name.includes('malformed') || name.includes('missing_session')) classes.add('malformed_event');
  if (name.includes('disconnected')) classes.add('disconnected');
  if (name.includes('high accuracy')) classes.add('high_accuracy_completion');
  if (name.includes('low accuracy')) classes.add('low_accuracy_completion');
  return classes;
}

export function analyzeCompanionScenarioCoverage(scenarios = [], options = {}) {
  const covered = new Set();
  const scenarioResults = scenarios.map(scenario => {
    const result = runCompanionReplayScenario(scenario);
    const classes = [...classifyScenario(scenario, result)].sort();
    classes.forEach(entry => covered.add(entry));
    return { scenarioId: scenario.id || scenario.name, classes };
  });
  const required = options.requiredClasses || COMPANION_V2_REQUIRED_COVERAGE_CLASSES;
  const missing = required.filter(entry => !covered.has(entry));
  const coveragePercent = Math.round(((required.length - missing.length) / required.length) * 100);
  return {
    required: [...required],
    covered: [...covered].sort(),
    missing,
    coveragePercent,
    passed: missing.length === 0,
    scenarioResults
  };
}
