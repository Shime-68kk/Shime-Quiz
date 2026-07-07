import { describe, expect, it } from 'vitest';
import { createExpressionProtocolGoldenFixtures } from '../../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { createEsp32ExpressionSerialQaKit } from '../../../src/shimeIntelligence/esp32ExpressionSerialQaKit.js';

describe('esp32ExpressionSerialQaKit', () => {
  it('generates newline payloads and separates valid from invalid fixtures', () => {
    const kit = createEsp32ExpressionSerialQaKit(createExpressionProtocolGoldenFixtures());
    expect(kit.expectedAcceptCount).toBe(12);
    expect(kit.expectedRejectCount).toBe(7);
    expect(kit.copyPasteBlocks.validBlock.split('\n')).toHaveLength(12);
    expect(kit.copyPasteBlocks.invalidBlock.split('\n')).toHaveLength(7);
  });
});

