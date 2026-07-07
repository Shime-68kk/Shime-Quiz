import { describe, expect, it } from 'vitest';
import { auditCompanionDecisionSequence, auditContainsForbiddenData } from '../../src/companion/companionDecisionAudit.js';

describe('companionDecisionAudit', () => {
  it('creates safe audit entries with reason codes', () => {
    const entries = auditCompanionDecisionSequence([{ eventType: 'session_started', payload: { progressCount: 0, totalCount: 3 } }]);
    expect(entries[0].reasonCodes.length).toBeGreaterThan(0);
    expect(entries[0].dryRunOnly).toBe(true);
    expect(auditContainsForbiddenData(entries)).toBe(false);
  });

  it('rejected sensitive event produces safe audit entry', () => {
    const entries = auditCompanionDecisionSequence([{ eventType: 'question_presented', payload: { question: 'private text' } }]);
    expect(entries[0]).toMatchObject({ accepted: false, privacyStatus: 'blocked', finalRobotIntent: 'neutral' });
    expect(JSON.stringify(entries)).not.toContain('private text');
  });
});

