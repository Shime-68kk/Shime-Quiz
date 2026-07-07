import fs from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';

const V2_FILES = [
  'src/companion/companionSessionModel.js',
  'src/companion/companionAdaptivePolicy.js',
  'src/companion/companionBehaviorMemory.js',
  'src/companion/companionHysteresis.js',
  'src/companion/companionQualityScoring.js',
  'src/companion/companionReplayBenchmark.js',
  'src/companion/companionDecisionAudit.js'
];

describe('companion cognitive engine privacy', () => {
  it('valid fixtures contain no forbidden keys', () => {
    const validFixtures = getCompanionReplayFixtures().filter(fixture => !fixture.name.includes('sensitive'));
    const serialized = JSON.stringify(validFixtures);
    ['"prompt"', '"question"', '"answer"', '"correctAnswer"', '"userAnswer"', '"sourceMetadata"', '"backupPayload"'].forEach(key => {
      expect(serialized).not.toContain(key);
    });
  });

  it('V2 files contain no storage/network/AI calls', () => {
    const combined = V2_FILES.map(file => fs.readFileSync(resolve(process.cwd(), file), 'utf8')).join('\n');
    ['localStorage', 'sessionStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'sendRobotCommand'].forEach(pattern => {
      expect(combined).not.toContain(pattern);
    });
  });
});

