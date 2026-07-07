import { describe, expect, it } from 'vitest';
import { collectForbiddenCompanionKeys } from '../../src/companion/companionContextSchema.js';
import { runCompanionBridgeSimulation, createCompanionBridgeSimulationTranscript } from '../../tools/deviceBridge/companionBridgeSimulator.mjs';

describe('companion end-to-end privacy', () => {
  it('safe scenario outputs contain no forbidden keys', () => {
    runCompanionBridgeSimulation()
      .filter(result => result.invalid !== true)
      .forEach(result => {
        result.results.forEach(entry => {
          expect(collectForbiddenCompanionKeys(entry.companionContext), result.scenario).toEqual([]);
          expect(collectForbiddenCompanionKeys(entry.robotEnvelope), result.scenario).toEqual([]);
        });
      });
  });

  it('sensitive scenario is blocked', () => {
    const sensitive = runCompanionBridgeSimulation().find(result => result.scenario === 'sensitive_payload_attack');

    expect(sensitive.results[0].accepted).toBe(false);
    expect(sensitive.results[0].robotIntent.command).toBe('neutral');
  });

  it('safe transcript does not include private content text', () => {
    const transcript = createCompanionBridgeSimulationTranscript().join('\n');

    ['private text', 'correctAnswer', 'userAnswer', 'sourceMetadata', 'backupPayload', 'rawQuizPayload'].forEach(text => {
      expect(transcript).not.toContain(text);
    });
  });
});
