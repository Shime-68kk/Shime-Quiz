import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createCompanionEvidenceBenchmark,
  writeCompanionEvidenceBenchmarkArtifacts
} from '../../tools/deviceBridge/companionEvidenceBenchmark.mjs';

describe('companionEvidenceBenchmark', () => {
  it('creates required evidence shapes and artifacts for 1000+ scenarios', () => {
    const report = createCompanionEvidenceBenchmark({ count: 1000, attackCount: 120, seed: 33 });
    expect(report.summary.scenarioCount).toBeGreaterThanOrEqual(1000);
    expect(report.summary.attackScenarioCount).toBeGreaterThanOrEqual(100);
    expect(report.summary.coveragePercent).toBe(100);
    expect(report.summary.readinessStatus).toBe('PASS');
    expect(report.summary.invariantFailures).toBe(0);
    expect(report.summary.dryRunFailures).toBe(0);
    const outputDir = mkdtempSync(join(tmpdir(), 'companion-v2-evidence-'));
    const files = writeCompanionEvidenceBenchmarkArtifacts(report, { outputDir });
    expect(files).toHaveLength(6);
    rmSync(outputDir, { recursive: true, force: true });
  });
});
