import { describe, expect, it } from 'vitest';
import {
  createPassingFsrsBetaEvidence,
  evaluateFsrsReadinessGate
} from '../../src/scheduler/fsrsReadinessGate.js';

describe('fsrsReadinessGate', () => {
  it('keeps FSRS from becoming default even when beta evidence passes', () => {
    const gate = evaluateFsrsReadinessGate(createPassingFsrsBetaEvidence());
    expect(gate).toMatchObject({
      fsrsCanBeDefault: false,
      fsrsCanBeBetaOptIn: true,
      readinessScore: 100
    });
  });

  it('blocks beta opt-in when required evidence is missing', () => {
    const gate = evaluateFsrsReadinessGate({ deterministicOutputPass: true });
    expect(gate.fsrsCanBeDefault).toBe(false);
    expect(gate.fsrsCanBeBetaOptIn).toBe(false);
    expect(gate.blockedReasons).toContain('rollback_not_available');
  });
});
