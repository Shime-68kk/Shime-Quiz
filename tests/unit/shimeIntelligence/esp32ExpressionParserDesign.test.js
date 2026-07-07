import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionParserDesign } from '../../../src/shimeIntelligence/esp32ExpressionParserDesign.js';

describe('esp32ExpressionParserDesign', () => {
  it('includes bounded size, nested forbidden scan, and no motion policy', () => {
    const design = createEsp32ExpressionParserDesign();
    expect(design.maxMessageBytes).toBe(2048);
    expect(design.forbiddenFieldPolicy).toContain('nested');
    expect(design.motionPolicy).toBe('locked');
    expect(design.platformioTestPlan).toContain('verify_no_motion');
  });
});

