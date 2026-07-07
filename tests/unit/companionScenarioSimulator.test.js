import { describe, expect, it } from 'vitest';
import {
  createCompanionScenarioTranscript,
  runCompanionScenarios
} from '../../tools/deviceBridge/companionScenarioSimulator.mjs';

describe('companionScenarioSimulator', () => {
  it('outputs deterministic transcript', () => {
    const first = createCompanionScenarioTranscript();
    const second = createCompanionScenarioTranscript();

    expect(first).toEqual(second);
    expect(first.join('\n')).toContain('[COMPANION SIM] first_question_presented');
    expect(first.join('\n')).toContain('command=focus');
  });

  it('blocks sensitive scenario', () => {
    const sensitive = runCompanionScenarios().find(result => result.name === 'sensitive_payload_attack');

    expect(sensitive.blocked).toBe(true);
    expect(sensitive.decision.intent).toBe('calm_error');
  });
});
