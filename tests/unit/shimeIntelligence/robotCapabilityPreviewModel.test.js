import { describe, expect, it } from 'vitest';
import { createRobotCapabilityHandshake } from '../../../src/shimeIntelligence/robotCapabilityHandshake.js';
import { createRobotCapabilityPreviewModel } from '../../../src/components/settings/robotCapabilityPreviewModel.js';

describe('robotCapabilityPreviewModel', () => {
  it('renders capabilities safely and hides setup secrets', () => {
    const model = createRobotCapabilityPreviewModel(createRobotCapabilityHandshake({ supportsDisplay: true, supportsLed: true, supportsMotion: true, motionLocked: true }));
    expect(model.displaySupportLabel).toBe('có');
    expect(model.motionLockedLabel).toBe('đã khóa');
    const serialized = JSON.stringify(model);
    expect(serialized).not.toContain('SSID');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('token');
  });
});
