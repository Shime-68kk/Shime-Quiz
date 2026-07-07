#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSafeCapsuleRehearsalScenario } from '../src/components/settings/safeCapsuleRehearsalLabModel.js';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const DOCS_GENERATED_DIR = path.join(ROOT, 'docs', 'generated', 'safe-capsule');

function parseArgs(argv) {
  const args = { scenario: 'steady_progress', out: null };
  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (entry === '--scenario') {
      args.scenario = argv[index + 1];
      index += 1;
    } else if (entry === '--out') {
      args.out = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function isSafeOutputPath(outputPath) {
  if (!outputPath) return false;
  const resolved = path.resolve(ROOT, outputPath);
  const tempRoot = path.resolve(os.tmpdir());
  return resolved.startsWith(DOCS_GENERATED_DIR) || resolved.startsWith(tempRoot);
}

export function createSafeCapsuleMockImportPackageCliResult(argv = []) {
  const args = parseArgs(argv);
  const result = runSafeCapsuleRehearsalScenario(args.scenario);

  if (!result.accepted || !result.mockPackage) {
    return {
      ok: false,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify({
        scenarioId: result.scenarioId,
        accepted: false,
        rejected: true,
        rejectionReasonCode: result.rejectionReasonCode,
        packageCreated: false
      }),
      error: result.rejectionReasonCode || 'REJECTED_UNSAFE_SCENARIO'
    };
  }

  const line = JSON.stringify(result.mockPackage);
  const summary = {
    scenarioId: result.scenarioId,
    accepted: true,
    rejected: false,
    packageCreated: true,
    target: result.mockPackage.target,
    bridgeMode: result.mockPackage.bridgeMode,
    checksumStatus: result.mockPackage.checksumStatus,
    realBridgeEnabled: result.mockPackage.realBridgeEnabled,
    transportEnabled: result.mockPackage.transportEnabled
  };

  if (!args.out) {
    return {
      ok: true,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify(summary),
      packageLine: line,
      error: null
    };
  }

  if (!isSafeOutputPath(args.out)) {
    return {
      ok: false,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify({ ...summary, packageCreated: false }),
      error: 'UNSAFE_OUTPUT_PATH'
    };
  }

  const outputPath = path.resolve(ROOT, args.out);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${line}\n`, 'utf8');

  return {
    ok: true,
    wroteFile: true,
    outputPath,
    stdout: JSON.stringify({ ...summary, outputPath }),
    packageLine: line,
    error: null
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = createSafeCapsuleMockImportPackageCliResult(process.argv.slice(2));
  process.stdout.write(`${result.stdout}\n`);
  if (!result.ok) process.exitCode = 1;
}
