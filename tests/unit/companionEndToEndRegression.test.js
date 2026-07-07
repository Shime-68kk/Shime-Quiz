import { describe, expect, it } from 'vitest';
import { SAFE_ROBOT_COMMANDS } from '../../src/companion/robotIntentPlanner.js';
import { runCompanionBridgeSimulation } from '../../tools/deviceBridge/companionBridgeSimulator.mjs';

describe('companion end-to-end regression', () => {
  it('all scenario outputs are deterministic and command-safe', () => {
    const first = runCompanionBridgeSimulation();
    const second = runCompanionBridgeSimulation();

    expect(first).toEqual(second);
    first.forEach(scenario => {
      scenario.results.forEach(result => {
        expect(SAFE_ROBOT_COMMANDS).toContain(result.robotIntent.command);
        expect(result.transcriptEntry.reasonCodes.length).toBeGreaterThan(0);
      });
    });
  });

  it('enforces key safety outcomes', () => {
    const byName = Object.fromEntries(runCompanionBridgeSimulation().map(result => [result.scenario, result]));

    expect(byName.transport_disconnected_mid_session.results[0].robotIntent.command).toBe('neutral');
    expect(byName.robot_sensor_unhealthy.results[0].companionDecision.reasonCodes).toContain('robot_presence_unavailable');
    expect(byName.premium_showcase_without_motion.results.every(result => result.robotIntent.mode === 'expression_only')).toBe(true);
    expect(byName.classroom_safe_mode.results[0].companionDecision.shouldNotify).toBe(false);
    expect(byName.sensitive_payload_attack.results[0].privacyStatus).toBe('blocked');
  });

  it('reports rejected and blocked events', () => {
    const byName = Object.fromEntries(runCompanionBridgeSimulation().map(result => [result.scenario, result]));

    expect(byName.malformed_event.report.rejectedCount).toBe(1);
    expect(byName.sensitive_payload_attack.report.privacyViolationsBlocked).toBe(1);
  });
});
