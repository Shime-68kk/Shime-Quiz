import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const V2_FILES = [
  'src/companion/companionInvariants.js',
  'src/companion/companionAdversarialGenerator.js',
  'src/companion/companionGoldenReplay.js',
  'src/companion/companionV2ReadinessGate.js',
  'src/companion/companionPolicyComparison.js',
  'src/companion/companionScenarioCoverage.js',
  'src/companion/companionSessionModel.js',
  'src/companion/companionAdaptivePolicy.js',
  'src/companion/companionBehaviorMemory.js',
  'src/companion/companionHysteresis.js',
  'src/companion/companionQualityScoring.js',
  'src/companion/companionReplayBenchmark.js',
  'src/companion/companionDecisionAudit.js'
];

describe('companionV2NoRuntimeCoupling', () => {
  it('does not import StudyRoom, DeviceBridge runtime, React, DOM, storage, network, or AI APIs', () => {
    const forbidden = /StudyRoom|deviceBridge|DeviceBridge|React|document\.|window\.|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket|MQTT|Bluetooth|Serial|ESP32|OPENAI|ANTHROPIC|GEMINI|API_KEY|emitStudyEvent|sendRobotCommand/;
    const matches = V2_FILES.flatMap(file => {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      return forbidden.test(source) ? [file] : [];
    });
    expect(matches).toEqual([]);
  });
});
