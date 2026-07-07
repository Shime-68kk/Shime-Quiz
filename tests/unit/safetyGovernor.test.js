import { describe, expect, it } from 'vitest';
import { createDefaultCompanionContext } from '../../src/companion/companionContextSchema.js';
import { governCompanionDecision } from '../../src/companion/safetyGovernor.js';

describe('safetyGovernor', () => {
  it('downgrades motion by default', () => {
    const context = createDefaultCompanionContext({ safetyState: { motionAllowed: false } });
    const result = governCompanionDecision({ shouldMove: true, allowedRobotActionFamily: 'celebrate' }, context);

    expect(result.allowed).toBe(true);
    expect(result.decision.shouldMove).toBe(false);
    expect(result.reasonCodes).toContain('motion_downgraded_by_default');
  });

  it('blocks when privacy lock fails', () => {
    const context = createDefaultCompanionContext({ safetyState: { privacyLock: false } });
    const result = governCompanionDecision({ allowedRobotActionFamily: 'focus' }, context);

    expect(result.allowed).toBe(false);
    expect(result.actionFamily).toBe('neutral');
    expect(result.reasonCodes).toContain('privacy_lock_failed');
  });

  it('rate-limits celebration spam', () => {
    const context = createDefaultCompanionContext();
    const result = governCompanionDecision({ allowedRobotActionFamily: 'celebrate' }, context, ['celebrate', 'celebrate']);

    expect(result.actionFamily).toBe('focus');
    expect(result.reasonCodes).toContain('celebration_rate_limited');
  });
});
