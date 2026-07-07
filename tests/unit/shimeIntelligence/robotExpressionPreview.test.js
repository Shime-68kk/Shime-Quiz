import { describe, expect, it } from 'vitest';
import { createRobotExpressionPreview } from '../../../src/shimeIntelligence/robotExpressionPreview.js';
import { mapFusionToRobotExpression } from '../../../src/shimeIntelligence/robotExpressionMapper.js';
import { runShimeEcosystemFusion } from '../../../src/shimeIntelligence/appRobotFusionEngine.js';

describe('robotExpressionPreview', () => {
  it('creates readable dry-run rows without raw JSON or sensitive output', () => {
    const fusion = runShimeEcosystemFusion({ fsrs: { dueCount: 20, retrievability: 0.5, stability: 4, difficulty: 6 }, robotProfile: { supportsDisplay: true } });
    const preview = createRobotExpressionPreview([mapFusionToRobotExpression(fusion)]);
    const serialized = JSON.stringify(preview);
    expect(preview[0].expressionFamilyLabel).toBeTruthy();
    expect(preview[0].dryRunLabel).toBe('dry-run / không gửi');
    expect(serialized).not.toContain('payload');
    expect(serialized).not.toContain('private');
  });
});
