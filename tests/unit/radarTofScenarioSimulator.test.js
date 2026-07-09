import { describe, expect, it } from 'vitest';
import { getRadarTofScenarioIds, runAllRadarTofScenarios, runRadarTofScenario } from '../../src/robotSensing/radarTofScenarioSimulator.js';

describe('radarTofScenarioSimulator', () => {
  it('runs every built-in scenario and passes expected states', () => {
    const results = runAllRadarTofScenarios();
    expect(results).toHaveLength(14);
    expect(results.every(result => result.passed)).toBe(true);
    expect(getRadarTofScenarioIds()).toContain('tof_blocked_by_book');
  });
  it('returns safe scenario shape', () => {
    const scenario = runRadarTofScenario('user_sits_off_axis_left');
    expect(scenario.expectedFusionState).toBe('user_present_off_axis');
    expect(scenario.steps.length).toBeGreaterThan(0);
    expect(JSON.stringify(scenario)).not.toMatch(/camera|microphone|identity|ssid|mac/);
  });
});
