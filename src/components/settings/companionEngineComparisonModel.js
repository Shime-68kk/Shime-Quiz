import { compareCompanionPolicies } from '../../companion/index.js';

function legacyDecisionFromRow(row = {}) {
  return {
    intent: row.companionIntent || 'neutral_wait',
    allowedRobotActionFamily: row.robotCommand || 'neutral',
    reasonCodes: row.reasonCodes || [],
    shouldMove: false
  };
}

function statusFromComparison(comparison = {}, v2Row = {}) {
  if (v2Row.v2Safety === 'blocked') return 'v2_blocked';
  if (comparison.label === 'v2_improved') return 'v2_safer';
  if (comparison.label === 'possible_regression' || comparison.label === 'needs_human_review') return 'v2_needs_review';
  return 'equivalent';
}

export function compareCompanionEngineOutputs(legacyRows = [], v2Rows = [], options = {}) {
  const count = Math.max(legacyRows.length, v2Rows.length);
  const rows = Array.from({ length: count }, (_, index) => {
    const legacy = legacyRows[index] || {};
    const v2 = v2Rows[index] || {};
    const comparison = compareCompanionPolicies(legacyDecisionFromRow(legacy), {
      adjustedIntent: v2.v2Intent,
      finalRobotIntent: v2.v2Command,
      reasonCodes: v2.v2ReasonCodes || [],
      shouldMove: false
    }, options);
    const comparisonStatus = statusFromComparison(comparison, v2);
    return {
      step: index + 1,
      legacyIntent: legacy.companionIntent || 'none',
      legacyCommand: legacy.robotCommand || 'neutral',
      v2Intent: v2.v2Intent || 'none',
      v2Command: v2.v2Command || 'neutral',
      comparisonStatus,
      differences: [
        legacy.companionIntent !== v2.v2Intent ? 'intent_changed' : null,
        legacy.robotCommand !== v2.v2Command ? 'command_changed' : null
      ].filter(Boolean),
      warnings: comparison.noSensitiveOutput ? [] : ['sensitive_output_blocked'],
      recommendation: comparisonStatus === 'v2_needs_review' ? 'review_before_integration' : 'dry_run_ok'
    };
  });
  const statuses = rows.map(row => row.comparisonStatus);
  return {
    comparisonStatus: statuses.includes('v2_needs_review')
      ? 'v2_needs_review'
      : statuses.includes('v2_blocked')
        ? 'v2_blocked'
        : statuses.includes('v2_safer')
          ? 'v2_safer'
          : 'equivalent',
    rows,
    warnings: rows.flatMap(row => row.warnings),
    recommendation: statuses.includes('v2_needs_review') ? 'review_before_integration' : 'safe_for_manual_qa'
  };
}
