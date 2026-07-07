import { describe, expect, it } from 'vitest';
import { createFakeRobotConsoleModel } from '../../../src/components/settings/fakeRobotConsoleModel.js';

describe('fakeRobotConsoleModel', () => {
  it('shows fake robot state with bounded transcript and no send controls', () => {
    const model = createFakeRobotConsoleModel({
      currentExpressionFamily: 'review_due_nudge',
      displayExpression: 'review_due_badge',
      ledPattern: 'soft_led',
      soundCue: 'none',
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent',
      recentPreviewRows: Array.from({ length: 20 }, (_, index) => ({ scenarioId: `s${index}` }))
    });
    expect(model.transcriptRows).toHaveLength(12);
    expect(model.dryRunOnly).toBe(true);
    expect(model.sendStatus).toBe('not_sent');
    expect(JSON.stringify(model)).not.toContain('Gửi');
  });
});
