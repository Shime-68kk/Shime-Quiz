import { describe, expect, it } from 'vitest';
import { runShimeEcosystemBenchmark } from '../../../src/shimeIntelligence/shimeEcosystemBenchmark.js';
import { createShimeEcosystemEvidence } from '../../../src/shimeIntelligence/shimeEcosystemGeneratedEvidence.js';

describe('shimeEcosystemNoSensitiveOutput', () => {
  it('benchmark evidence contains no forbidden sensitive fields', () => {
    const evidence = createShimeEcosystemEvidence(runShimeEcosystemBenchmark());
    const serialized = JSON.stringify(evidence);
    ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'rawQuizPayload'].forEach(key => {
      expect(serialized).not.toContain(key);
    });
  });
});
