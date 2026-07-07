import { describe, expect, it } from 'vitest';
import { createRobotCapabilityHandshake, validateRobotCapabilityHandshake } from '../../../src/shimeIntelligence/robotCapabilityHandshake.js';

describe('robotCapabilityHandshake', () => {
  it('accepts valid dry-run schema-only handshake', () => {
    const handshake = createRobotCapabilityHandshake({ supportsDisplay: true, supportsLed: true, supportsMotion: true, motionLocked: true });
    const validation = validateRobotCapabilityHandshake(handshake);
    expect(validation.ok).toBe(true);
    expect(handshake.dryRunOnly).toBe(true);
    expect(handshake.sendStatus).toBe('not_sent');
  });

  it('rejects unknown version, unlocked motion, setup secrets, sensitive fields, and non dry-run', () => {
    expect(validateRobotCapabilityHandshake(createRobotCapabilityHandshake({ handshakeVersion: 'unknown' })).failures).toContain('handshake_needs_update');
    expect(validateRobotCapabilityHandshake({ ...createRobotCapabilityHandshake({ supportsMotion: true }), motionLocked: false }).failures).toContain('motion_lock_missing_or_false');
    expect(validateRobotCapabilityHandshake({ ...createRobotCapabilityHandshake(), wifiPassword: 'secret' }).failures.some(failure => failure.includes('setup_secret_not_allowed'))).toBe(true);
    expect(validateRobotCapabilityHandshake({ ...createRobotCapabilityHandshake(), question: 'private' }).failures).toContain('sensitive_handshake_field');
    expect(validateRobotCapabilityHandshake({ ...createRobotCapabilityHandshake(), dryRunOnly: false }).failures).toContain('handshake_not_dry_run');
  });
});
