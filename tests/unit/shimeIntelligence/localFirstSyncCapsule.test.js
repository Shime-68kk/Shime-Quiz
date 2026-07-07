import { describe, expect, it } from 'vitest';
import { createLocalFirstSyncCapsule } from '../../../src/shimeIntelligence/localFirstSyncCapsule.js';

describe('localFirstSyncCapsule', () => {
  it('creates deterministic dry-run capsules without sync implementation', () => {
    const capsule = createLocalFirstSyncCapsule({ capsuleType: 'learning_state_capsule' }, { capsuleId: 'c1' });
    expect(capsule).toMatchObject({ capsuleId: 'c1', dryRunOnly: true, conflictPolicy: 'app_authority_wins' });
    expect(createLocalFirstSyncCapsule({ answer: 'private' }).privacyClass).toBe('blocked');
  });
});
