import { describe, expect, it } from 'vitest';
import { createRobotExpressionDisplayModel, getRobotExpressionFamilyLabel } from '../../../src/shimeIntelligence/robotExpressionDisplayModel.js';

describe('robotExpressionDisplayModel', () => {
  it('provides Vietnamese labels and safe unknown fallback', () => {
    expect(getRobotExpressionFamilyLabel('review_due_nudge')).toBe('Nhắc ôn tập nhẹ');
    expect(getRobotExpressionFamilyLabel('unknown')).toBe('Không rõ');
    const model = createRobotExpressionDisplayModel({ expressionFamily: 'gentle_encourage', motionPolicy: 'locked', dryRunOnly: true, sendStatus: 'not_sent' });
    expect(model.expressionFamilyLabel).toBe('Khích lệ nhẹ');
    expect(JSON.stringify(model)).not.toContain('payload');
  });
});
