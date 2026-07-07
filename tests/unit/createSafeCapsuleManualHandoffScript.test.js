import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createSafeCapsuleMockImportPackageCliResult } from '../../scripts/create-safe-capsule-mock-import-package.js';

describe('manual handoff CLI mode', () => {
  it('prints safe manifest by default', () => {
    const result = createSafeCapsuleMockImportPackageCliResult(['--handoff', '--scenario', 'all_safe']);
    const summary = JSON.parse(result.stdout);
    expect(result.ok).toBe(true);
    expect(result.wroteFile).toBe(false);
    expect(summary.packageCount).toBe(4);
    expect(summary.bridgeMode).toBe('manual_handoff_mock_only');
    expect(summary.realBridgeEnabled).toBe(false);
    expect(summary.transportEnabled).toBe(false);
  });

  it('writes safe JSONL only with explicit output', () => {
    const output = path.join(os.tmpdir(), `shime-handoff-${Date.now()}.jsonl`);
    const result = createSafeCapsuleMockImportPackageCliResult(['--handoff', '--scenario', 'all_safe', '--out', output]);
    expect(result.ok).toBe(true);
    const text = fs.readFileSync(output, 'utf8');
    expect(text.trim().split('\n').length).toBe(4);
    expect(text).toContain('R5X19.2_SAFE_MOCK_IMPORT');
    expect(text).not.toMatch(/private question|private answer|HomeNetwork|secret-token|card_private/);
    fs.unlinkSync(output);
  });
});
