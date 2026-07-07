import { describe, expect, it } from 'vitest';
import { createShimeExpressionControlCenterManualQa } from '../../../src/components/settings/shimeExpressionManualQaModel.js';

describe('shimeExpressionManualQaModel', () => {
  it('contains manual QA items for expression preview control center', () => {
    const checklist = createShimeExpressionControlCenterManualQa();
    expect(checklist.items.length).toBeGreaterThanOrEqual(10);
    expect(checklist.items.join(' ')).toContain('Section D');
    expect(checklist.dryRunOnly).toBe(true);
    expect(checklist.sendStatus).toBe('not_sent');
  });
});
