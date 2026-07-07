import { describe, expect, it } from 'vitest';
import { runShimeEcosystemFusion } from '../../../src/shimeIntelligence/appRobotFusionEngine.js';
import { mapFusionToRobotExpression } from '../../../src/shimeIntelligence/robotExpressionMapper.js';

function plan(input) {
  const fusion = runShimeEcosystemFusion(input);
  return mapFusionToRobotExpression({ ...fusion, robotCapabilityProfile: input.robotProfile, safetyMode: input.safetyMode, transportHealth: input.transportHealth, robotAvailability: input.robotAvailability });
}

describe('robotExpressionMapper', () => {
  it('maps memory and recovery states to expression families', () => {
    expect(plan({ fsrs: { dueCount: 40, retrievability: 0.7, stability: 8, difficulty: 4 }, robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('review_due_nudge');
    expect(plan({ fsrs: { dueCount: 1, retrievability: 0.25, stability: 1, difficulty: 8 }, robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('memory_risk_nudge');
    expect(plan({ fsrs: { dueCount: 4, retrievability: 0.4, stability: 2, difficulty: 8, lapseCount: 4, wrongCount: 3, completionQualityBucket: 'low' }, robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('gentle_encourage');
    expect(plan({ sessionPhase: 'complete', fsrs: { dueCount: 0, retrievability: 0.9, stability: 45, difficulty: 3 }, robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('celebrate_stability_gain');
  });

  it('handles unsafe, limited, and motion-capable robots safely', () => {
    expect(plan({ fsrs: { question: 'private' }, robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('calm_error');
    expect(plan({ fsrs: { dueCount: 5, retrievability: 0.5, stability: 3, difficulty: 4 }, transportHealth: 'disconnected', robotProfile: { supportsDisplay: true } }).expressionFamily).toBe('reconnect_hint');
    expect(plan({ fsrs: { dueCount: 5, retrievability: 0.5, stability: 3, difficulty: 4 }, robotAvailability: 'offline', robotProfile: { supportsDisplay: true, available: false } }).expressionFamily).toBe('do_nothing');
    expect(plan({ fsrs: { dueCount: 8, retrievability: 0.5, stability: 3, difficulty: 4 }, robotProfile: { supportsDisplay: true, supportsLed: false, supportsSound: false } }).allowedChannels).toEqual(['display_expression']);
    expect(plan({ fsrs: { dueCount: 8, retrievability: 0.5, stability: 3, difficulty: 4 }, robotProfile: { supportsDisplay: false, supportsLed: true, supportsSound: false } }).allowedChannels).toEqual(['led_expression']);
    expect(plan({ fsrs: { dueCount: 8, retrievability: 0.5, stability: 3, difficulty: 4 }, robotProfile: { supportsDisplay: true, supportsMotion: true, motionLocked: true } }).motionPolicy).toBe('locked');
  });
});
