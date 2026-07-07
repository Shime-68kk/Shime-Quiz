import { describe, expect, it } from 'vitest';
import { runRobotExpressionPreviewPanel } from '../../../src/components/settings/robotExpressionPreviewPanelAdapter.js';
import { runShimeFusionPanelDryRun } from '../../../src/components/settings/shimeEcosystemFusionPanelAdapter.js';

describe('robotExpressionPreviewPanelAdapter', () => {
  it('requires Shime fusion result before expression preview', () => {
    const result = runRobotExpressionPreviewPanel(null);
    expect(result.empty).toBe(true);
    expect(result.message).toContain('Hãy chạy khớp nối Shime trước');
  });

  it('creates safe UI labels after Shime fusion', () => {
    const fusion = runShimeFusionPanelDryRun({ fsrs: { dueCount: 10, retrievability: 0.4, stability: 4, difficulty: 6 }, robotProfile: { supportsDisplay: true } });
    const result = runRobotExpressionPreviewPanel(fusion);
    expect(result.empty).toBe(false);
    expect(result.expressionDisplay.expressionFamilyLabel).toBeTruthy();
    expect(result.fakeRobotConsole.fakeRobotStatusLabel).toContain('không gửi');
    expect(result.capabilityPreview.motionLockedLabel).toBe('đã khóa');
    expect(JSON.stringify(result)).not.toContain('payload');
  });
});
