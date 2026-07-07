import { describe, expect, it } from 'vitest';
import { createDefaultCompanionContext } from '../../src/companion/companionContextSchema.js';
import { createCompanionDecision } from '../../src/companion/companionPolicyEngine.js';

describe('companionPolicyEngine', () => {
  it('produces explainable focus decision', () => {
    const context = createDefaultCompanionContext({
      learningState: { sessionPhase: 'question' },
      sessionState: { transportStatus: 'connected' }
    });
    const decision = createCompanionDecision(context);

    expect(decision).toMatchObject({
      intent: 'focus_gently',
      allowedRobotActionFamily: 'focus'
    });
    expect(decision.reasonCodes).toContain('study_focus');
  });

  it('suggests break on high frustration risk', () => {
    const context = createDefaultCompanionContext({
      performanceState: { frustrationRiskBucket: 'high' },
      sessionState: { transportStatus: 'connected' }
    });

    expect(createCompanionDecision(context)).toMatchObject({
      intent: 'suggest_break',
      allowedRobotActionFamily: 'encourage'
    });
  });

  it('calms down on sensitive context', () => {
    const decision = createCompanionDecision({ prompt: 'private' });

    expect(decision.intent).toBe('calm_error');
    expect(decision.reasonCodes).toContain('invalid_or_sensitive_context');
  });
});
