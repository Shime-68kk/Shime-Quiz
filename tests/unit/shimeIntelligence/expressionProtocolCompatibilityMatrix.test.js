import { describe, expect, it } from 'vitest';
import { createExpressionProtocolCompatibilityMatrix } from '../../../src/shimeIntelligence/expressionProtocolCompatibilityMatrix.js';

describe('expressionProtocolCompatibilityMatrix', () => {
  it('accepts safe compatible minor versions', () => {
    const matrix = createExpressionProtocolCompatibilityMatrix({ expressionEnvelopeVersion: '1.2.0' });
    expect(matrix.compatibilityStatus).toBe('compatible');
  });

  it('rejects unknown major and missing versions', () => {
    expect(createExpressionProtocolCompatibilityMatrix({ expressionEnvelopeVersion: '2.0.0' }).compatibilityStatus).toBe('incompatible');
    expect(createExpressionProtocolCompatibilityMatrix({ firmwareParserVersion: '' }).compatibilityStatus).toBe('incompatible');
  });
});

