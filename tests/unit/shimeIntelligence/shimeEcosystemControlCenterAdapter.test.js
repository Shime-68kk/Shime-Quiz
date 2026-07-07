import { describe, expect, it } from 'vitest';
import { runShimeFusionPanelDryRun } from '../../../src/components/settings/shimeEcosystemFusionPanelAdapter.js';

describe('shimeEcosystemControlCenterAdapter', () => {
  it('handles empty state without fake data', () => {
    const result = runShimeFusionPanelDryRun({});
    expect(result.empty).toBe(true);
    expect(result.message).toContain('Chưa có đủ tín hiệu');
    expect(result.dryRunOnly).toBe(true);
    expect(result.sendStatus).toBe('not_sent');
  });

  it('returns UI-safe labels for safe Shime fusion output', () => {
    const result = runShimeFusionPanelDryRun({ fsrs: { dueCount: 8, retrievability: 0.4, stability: 4, difficulty: 6 }, robotProfile: { supportsDisplay: true } });
    expect(result.snapshot.dryRunOnly).toBe(true);
    expect(result.snapshot.sendStatus).toBe('not_sent');
    expect(result.snapshot.memoryPressureLabel).toBeTruthy();
    expect(result.snapshot.forgettingRiskLabel).toBeTruthy();
    expect(result.snapshot.recoveryNeedLabel).toBeTruthy();
    expect(result.snapshot.robotInterventionLabel).toBeTruthy();
    expect(result.snapshot.timetableRecommendationLabel).toBeTruthy();
    expect(result.snapshot.transportRecommendationLabel).toBeTruthy();
    expect(JSON.stringify(result)).not.toContain('payload');
  });

  it('blocks sensitive input and does not expose raw fields', () => {
    const result = runShimeFusionPanelDryRun({ fsrs: { question: 'private text' }, robotProfile: { supportsDisplay: true } });
    expect(result.snapshot.privacyStatusLabel).toBe('đã chặn');
    expect(result.snapshot.capsuleStatusLabel).toBe('capsule đã chặn');
    expect(JSON.stringify(result)).not.toContain('private text');
  });
});
