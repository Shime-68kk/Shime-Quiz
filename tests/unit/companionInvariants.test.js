import { describe, expect, it } from 'vitest';
import {
  assertCompanionDecisionInvariants,
  checkCompanionOutputForSensitiveData,
  checkCompanionReplayInvariants,
  summarizeInvariantFailures
} from '../../src/companion/companionInvariants.js';

describe('companionInvariants', () => {
  it('passes a safe dry-run decision', () => {
    const result = assertCompanionDecisionInvariants({
      adjustedIntent: 'focus_gently',
      finalRobotIntent: 'focus',
      reasonCodes: ['study_focus'],
      dryRunOnly: true
    });
    expect(result.ok).toBe(true);
  });

  it('fails sensitive output recursively', () => {
    const result = checkCompanionOutputForSensitiveData({ nested: { correctAnswer: 'private' } });
    expect(result.ok).toBe(false);
    expect(summarizeInvariantFailures(result.failures).codes).toContain('sensitive_key_present');
  });

  it('requires unsafe transport to be neutral or reconnect safe', () => {
    const result = assertCompanionDecisionInvariants({
      adjustedIntent: 'celebrate_small',
      finalRobotIntent: 'celebrate',
      reasonCodes: ['transport_unsafe'],
      dryRunOnly: true
    }, { transportUnsafe: true });
    expect(result.ok).toBe(false);
    expect(result.failures.map(failure => failure.code)).toContain('unsafe_transport_not_neutralized');
  });

  it('fails missing reason codes, forbidden command, and motion', () => {
    const result = assertCompanionDecisionInvariants({
      adjustedIntent: 'celebrate_big',
      finalRobotIntent: 'spin_motor',
      shouldMove: true,
      dryRunOnly: true
    });
    expect(result.ok).toBe(false);
    expect(result.failures.map(failure => failure.code)).toEqual(expect.arrayContaining([
      'missing_reason_codes',
      'command_not_allowed',
      'motion_not_allowed_by_default'
    ]));
  });

  it('checks replay audit entries are dry-run only', () => {
    const result = checkCompanionReplayInvariants({
      name: 'unsafe',
      eventCount: 1,
      finalIntent: 'focus_gently',
      finalCommand: 'focus',
      quality: {},
      audit: [{ policyIntent: 'focus_gently', finalRobotIntent: 'focus', reasonCodes: ['study_focus'], dryRunOnly: false }]
    });
    expect(result.ok).toBe(false);
    expect(result.failures.map(failure => failure.code)).toContain('audit_not_dry_run');
  });
});
