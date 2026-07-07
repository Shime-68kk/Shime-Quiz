import fs from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';
import { runCompanionReplayBenchmark } from '../../src/companion/companionReplayBenchmark.js';

describe('companion cognitive engine regression', () => {
  it('runs end-to-end V2 scenario matrix without robot send', () => {
    const report = runCompanionReplayBenchmark(getCompanionReplayFixtures());
    expect(report.scenarioCount).toBe(18);
    expect(JSON.stringify(report)).not.toContain('sendRobotCommand');
  });

  it('has no StudyRoom, DeviceBridge runtime, or UI dependency in V2 files', () => {
    const files = [
      'src/companion/companionSessionModel.js',
      'src/companion/companionAdaptivePolicy.js',
      'src/companion/companionReplayBenchmark.js',
      'src/companion/companionDecisionAudit.js'
    ];
    const combined = files.map(file => fs.readFileSync(resolve(process.cwd(), file), 'utf8')).join('\n');
    expect(combined).not.toContain('StudyRoom');
    expect(combined).not.toContain('deviceBridgeRuntime');
    expect(combined).not.toContain('CompanionDevPanel');
  });
});

