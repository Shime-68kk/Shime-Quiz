import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionFirmwarePatchBlueprint } from '../../../src/shimeIntelligence/esp32ExpressionFirmwarePatchBlueprint.js';

describe('esp32ExpressionFirmwarePatchBlueprint', () => {
  it('lists allowed target files and forbids unsafe scope', () => {
    const blueprint = createEsp32ExpressionFirmwarePatchBlueprint();
    expect(blueprint.targetFilesLikelyToChange).toContain('firmware/esp32-shime-robot/src/ShimeProtocol.cpp');
    expect(blueprint.noMotionGuarantees).toContain('no_servo_attach');
    expect(blueprint.noRadioRequirement).toBe(true);
    expect(blueprint.noSecretRequirement).toBe(true);
  });
});

