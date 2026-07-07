import { assertRobotExpressionSafety } from './robotExpressionSafetyGate.js';
import { createRobotExpressionPreviewRow } from './robotExpressionPreview.js';

const DEFAULT_LIMIT = 20;

export function resetFakeRobotExpressionRuntime(options = {}) {
  return {
    currentExpressionFamily: 'neutral_presence',
    displayExpression: 'soft_idle_face',
    ledPattern: 'steady_dim',
    soundCue: 'none',
    motionPolicy: 'locked',
    safetyStatus: 'idle_safe',
    privacyStatus: 'redacted_coarse_only',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    recentPreviewRows: [],
    reasonCodes: ['fake_robot_runtime_reset'],
    transcriptLimit: options.transcriptLimit || DEFAULT_LIMIT
  };
}

export function createFakeRobotExpressionRuntime(options = {}) {
  return resetFakeRobotExpressionRuntime(options);
}

export function applyRobotExpressionPlan(runtimeState = resetFakeRobotExpressionRuntime(), expressionPlan = {}, options = {}) {
  const safety = assertRobotExpressionSafety(expressionPlan);
  const safePlan = safety.ok ? expressionPlan : {
    expressionFamily: 'calm_error',
    displayExpression: 'calm_error_notice',
    ledPattern: 'calm_error_soft_led',
    soundCue: 'none',
    motionPolicy: 'locked',
    safetyStatus: 'blocked',
    privacyStatus: 'blocked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: [...(expressionPlan.reasonCodes || []), ...safety.failures]
  };
  const row = createRobotExpressionPreviewRow(safePlan, {
    scenarioId: options.scenarioId || `fake_robot_${runtimeState.recentPreviewRows?.length || 0}`
  });
  const limit = runtimeState.transcriptLimit || options.transcriptLimit || DEFAULT_LIMIT;
  const recentPreviewRows = [...(runtimeState.recentPreviewRows || []), row].slice(-limit);
  return {
    ...runtimeState,
    currentExpressionFamily: safePlan.expressionFamily,
    displayExpression: safePlan.displayExpression || 'none',
    ledPattern: safePlan.ledPattern || 'none',
    soundCue: safePlan.soundCue || 'none',
    motionPolicy: 'locked',
    safetyStatus: safePlan.safetyStatus || (safety.ok ? 'pass' : 'blocked'),
    privacyStatus: safePlan.privacyStatus || 'redacted_coarse_only',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    recentPreviewRows,
    reasonCodes: [...new Set([...(safePlan.reasonCodes || []), 'fake_robot_expression_applied'])],
    transcriptLimit: limit
  };
}

export function getFakeRobotExpressionSnapshot(runtimeState = resetFakeRobotExpressionRuntime()) {
  return {
    currentExpressionFamily: runtimeState.currentExpressionFamily || 'neutral_presence',
    displayExpression: runtimeState.displayExpression || 'none',
    ledPattern: runtimeState.ledPattern || 'none',
    soundCue: runtimeState.soundCue || 'none',
    motionPolicy: 'locked',
    safetyStatus: runtimeState.safetyStatus || 'idle_safe',
    privacyStatus: runtimeState.privacyStatus || 'redacted_coarse_only',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    recentPreviewRows: [...(runtimeState.recentPreviewRows || [])],
    reasonCodes: [...(runtimeState.reasonCodes || [])]
  };
}
