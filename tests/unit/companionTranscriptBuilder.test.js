import { describe, expect, it } from 'vitest';
import {
  createCompanionTranscriptEntry,
  formatCompanionTranscript
} from '../../src/companion/companionTranscriptBuilder.js';

describe('companionTranscriptBuilder', () => {
  it('creates deterministic transcript entries with reason codes', () => {
    const input = {
      step: 1,
      event: { eventType: 'question_presented' },
      accepted: true,
      companionDecision: { intent: 'focus_gently', tone: 'calm', reasonCodes: ['study_focus'] },
      safetyDecision: { allowed: true, reasonCodes: ['allowed_expression_only'] },
      robotIntent: { command: 'focus', reasonCodes: ['allowed_expression_only'] }
    };

    expect(createCompanionTranscriptEntry(input)).toEqual(createCompanionTranscriptEntry(input));
    expect(createCompanionTranscriptEntry(input).reasonCodes).toContain('study_focus');
    expect(formatCompanionTranscript([input])[0]).toContain('command=focus');
  });

  it('marks forbidden input as privacy blocked', () => {
    const entry = createCompanionTranscriptEntry({ event: { eventType: 'x', payload: { prompt: 'private' } } });

    expect(entry.privacyStatus).toBe('blocked');
  });
});
