import { describe, expect, it } from 'vitest';
import { createCompanionPremiumDemoTranscript } from '../../tools/deviceBridge/companionPremiumDemoTranscript.mjs';

describe('companionPremiumDemoTranscript', () => {
  it('contains premium UX beats with safe commands only', () => {
    const transcript = createCompanionPremiumDemoTranscript().join('\n');

    expect(transcript).toContain('local deterministic companion simulation');
    expect(transcript).toContain('command=focus');
    expect(transcript).toContain('command=celebrate');
    expect(transcript).toContain('command=neutral');
    expect(transcript).not.toContain('spin_motor');
  });

  it('does not contain content-specific quiz text', () => {
    const transcript = createCompanionPremiumDemoTranscript().join('\n');

    ['private text', 'correctAnswer', 'userAnswer', 'explanation', 'sourceMetadata'].forEach(text => {
      expect(transcript).not.toContain(text);
    });
  });
});
