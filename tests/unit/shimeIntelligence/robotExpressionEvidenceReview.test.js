import { describe, expect, it } from 'vitest';
import { reviewRobotExpressionControlCenterEvidence } from '../../../src/shimeIntelligence/robotExpressionEvidenceReview.js';

function artifacts(overrides = {}) {
  return {
    'shime-fake-robot-console.json': { dryRunOnly: true, sendStatus: 'not_sent' },
    'shime-expression-control-center-evidence.json': { dryRunOnly: true, sendStatus: 'not_sent', expressionPreviews: [{ motionPolicyLabel: 'motion locked' }] },
    'shime-robot-expression-manual-qa.json': { itemCount: 12, dryRunOnly: true, sendStatus: 'not_sent' },
    'shime-robot-expression-ui-privacy-audit.json': { status: 'PASS', dryRunOnly: true, sendStatus: 'not_sent' },
    ...overrides
  };
}

describe('robotExpressionEvidenceReview', () => {
  it('passes complete safe artifacts and fails missing/privacy cases', () => {
    expect(reviewRobotExpressionControlCenterEvidence(artifacts()).overallStatus).toBe('PASS');
    const missing = artifacts();
    delete missing['shime-fake-robot-console.json'];
    expect(reviewRobotExpressionControlCenterEvidence(missing).overallStatus).toBe('FAIL');
    expect(reviewRobotExpressionControlCenterEvidence(artifacts({ 'shime-robot-expression-ui-privacy-audit.json': { status: 'FAIL' } })).overallStatus).toBe('FAIL');
  });
});
