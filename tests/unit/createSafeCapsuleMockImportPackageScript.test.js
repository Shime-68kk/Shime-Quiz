import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createSafeCapsuleMockImportPackageCliResult } from '../../scripts/create-safe-capsule-mock-import-package.js';

describe('create-safe-capsule-mock-import-package script', () => {
  it('prints safe summary by default and does not write files', () => {
    const result = createSafeCapsuleMockImportPackageCliResult(['--scenario', 'steady_progress']);
    const summary = JSON.parse(result.stdout);

    expect(result.ok).toBe(true);
    expect(result.wroteFile).toBe(false);
    expect(result.outputPath).toBe(null);
    expect(summary).toMatchObject({
      scenarioId: 'steady_progress',
      packageCreated: true,
      target: 'R5X19.2_SAFE_MOCK_IMPORT',
      realBridgeEnabled: false,
      transportEnabled: false
    });
  });

  it('creates JSONL with explicit safe temp output path', () => {
    const outputPath = path.join(os.tmpdir(), `shime-safe-capsule-${Date.now()}.jsonl`);
    const result = createSafeCapsuleMockImportPackageCliResult(['--scenario', 'review_pressure_high', '--out', outputPath]);

    expect(result.ok).toBe(true);
    expect(result.wroteFile).toBe(true);
    const line = fs.readFileSync(outputPath, 'utf8').trim();
    const parsed = JSON.parse(line);
    expect(parsed.target).toBe('R5X19.2_SAFE_MOCK_IMPORT');
    expect(parsed.realBridgeEnabled).toBe(false);
    expect(parsed.transportEnabled).toBe(false);
    expect(line).not.toMatch(/private question|private answer|HomeNetwork|secret-token|deck_private/);
    fs.unlinkSync(outputPath);
  });

  it('rejects unsafe scenarios and unsafe output paths', () => {
    expect(createSafeCapsuleMockImportPackageCliResult(['--scenario', 'privacy_attack_secret']).ok).toBe(false);
    expect(createSafeCapsuleMockImportPackageCliResult(['--scenario', 'steady_progress', '--out', 'unsafe.jsonl']).ok).toBe(false);
  });
});
