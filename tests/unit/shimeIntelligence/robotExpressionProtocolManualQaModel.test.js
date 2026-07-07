import { describe, expect, it } from 'vitest';
import { createRobotExpressionProtocolManualQaModel } from '../../../src/shimeIntelligence/robotExpressionProtocolManualQaModel.js';

describe('robotExpressionProtocolManualQaModel', () => {
  it('creates a dry-run manual QA checklist', () => {
    const model = createRobotExpressionProtocolManualQaModel();
    expect(model.itemCount).toBeGreaterThanOrEqual(10);
    expect(model.items.join(' ')).toContain('no send button');
    expect(model.items.join(' ')).toContain('no connect button');
    expect(model.motionPolicy).toBe('locked');
    expect(model.sendStatus).toBe('not_sent');
  });
});

