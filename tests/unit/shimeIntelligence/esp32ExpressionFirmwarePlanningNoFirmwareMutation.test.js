import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionFirmwarePatchBlueprint } from '../../../src/shimeIntelligence/esp32ExpressionFirmwarePatchBlueprint.js';

describe('esp32ExpressionFirmwarePlanningNoFirmwareMutation', () => {
  it('is a blueprint only and does not include firmware code bodies', () => {
    const blueprint = createEsp32ExpressionFirmwarePatchBlueprint();
    expect(JSON.stringify(blueprint)).not.toContain('#include');
    expect(JSON.stringify(blueprint)).not.toContain('digitalWrite');
    expect(JSON.stringify(blueprint)).not.toContain('Servo');
  });
});

