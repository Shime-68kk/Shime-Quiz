import { describe, expect, it } from 'vitest';
import { createDefaultCompanionContext } from '../../src/companion/companionContextSchema.js';
import { planRobotIntent, SAFE_ROBOT_COMMANDS } from '../../src/companion/robotIntentPlanner.js';

describe('robotIntentPlanner', () => {
  it('maps decisions to safe robot commands only', () => {
    const context = createDefaultCompanionContext();
    SAFE_ROBOT_COMMANDS.forEach(command => {
      expect(planRobotIntent({ allowedRobotActionFamily: command }, context).command).toBe(command);
    });
    expect(planRobotIntent({ allowedRobotActionFamily: 'unsafe' }, context).command).toBe('neutral');
  });

  it('never includes raw payload fields', () => {
    const context = createDefaultCompanionContext();
    const intent = planRobotIntent({ allowedRobotActionFamily: 'encourage' }, context);
    const serialized = JSON.stringify(intent);

    ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer'].forEach(field => {
      expect(serialized).not.toContain(`"${field}"`);
    });
  });
});
