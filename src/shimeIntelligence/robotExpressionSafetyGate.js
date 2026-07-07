import {
  ALLOWED_ROBOT_EXPRESSION_CHANNELS,
  ALLOWED_ROBOT_EXPRESSION_FAMILIES,
  FORBIDDEN_ROBOT_EXPRESSION_CHANNELS
} from './robotExpressionContract.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

export function validateRobotExpressionPlan(plan = {}) {
  const failures = [];
  if (findSensitiveKeys(plan).length > 0) failures.push('sensitive_expression_plan');
  if (!ALLOWED_ROBOT_EXPRESSION_FAMILIES.includes(plan.expressionFamily)) failures.push('expression_family_not_allowed');
  (plan.allowedChannels || []).forEach(channel => {
    if (!ALLOWED_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`channel_not_allowed:${channel}`);
  });
  (plan.forbiddenChannels || []).forEach(channel => {
    if (!FORBIDDEN_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`unknown_forbidden_channel:${channel}`);
  });
  (plan.allowedChannels || []).forEach(channel => {
    if (FORBIDDEN_ROBOT_EXPRESSION_CHANNELS.includes(channel)) failures.push(`forbidden_channel_enabled:${channel}`);
  });
  if (plan.motionPolicy !== 'locked') failures.push('motion_not_locked');
  if (plan.dryRunOnly !== true) failures.push('expression_not_dry_run');
  if (plan.sendStatus !== 'not_sent') failures.push('expression_send_status_not_safe');
  if (plan.opensConnection === true) failures.push('transport_connect_not_allowed');
  if (plan.scheduleMutationAllowed === true || plan.mutatesSchedule === true) failures.push('schedule_mutation_not_allowed');
  if (plan.notificationAllowed === true) failures.push('notification_not_allowed');
  if (plan.calendarMutationAllowed === true) failures.push('calendar_mutation_not_allowed');
  if (!Array.isArray(plan.reasonCodes) || plan.reasonCodes.length === 0) failures.push('missing_reason_codes');
  return { ok: failures.length === 0, failures, reasonCodes: ['robot_expression_plan_validated'] };
}

export function assertRobotExpressionSafety(plan = {}) {
  const result = validateRobotExpressionPlan(plan);
  return {
    ...result,
    safetyStatus: result.ok ? 'pass' : 'fail',
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function summarizeRobotExpressionSafety(result = {}) {
  return {
    safetyStatus: result.safetyStatus || (result.ok ? 'pass' : 'fail'),
    failureCount: Array.isArray(result.failures) ? result.failures.length : 0,
    failures: [...(result.failures || [])],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: [...(result.reasonCodes || []), 'robot_expression_safety_summarized']
  };
}
