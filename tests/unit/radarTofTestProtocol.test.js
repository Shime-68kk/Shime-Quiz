import { describe, expect, it } from 'vitest';
import { createRadarTofTestProtocol, formatRadarTofProtocolMarkdown } from '../../src/robotSensing/radarTofTestProtocol.js';

describe('radarTofTestProtocol', () => {
  it('generates structured protocols for real-world tests', () => {
    const protocols = createRadarTofTestProtocol();
    expect(protocols.map(p => p.testId)).toContain('front_user_60cm');
    expect(protocols.map(p => p.testId)).toContain('person_walk_by_no_interaction');
    expect(protocols.every(p => p.setup && p.passRule && p.expectedFusionState)).toBe(true);
  });
  it('formats safe markdown-like protocol', () => {
    const text = formatRadarTofProtocolMarkdown();
    expect(text).toContain('front_user_60cm');
    expect(text).toContain('without camera, microphone, cloud');
    expect(text).not.toMatch(/raw frame data|identity/);
  });
});
