#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSafeCapsuleRehearsalScenario } from '../src/components/settings/safeCapsuleRehearsalLabModel.js';
import {
  createManualSafeCapsuleHandoffPack,
  serializeManualHandoffJsonl
} from '../src/deviceBridge/safeCapsuleManualExportPackage.js';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const DOCS_GENERATED_DIR = path.join(ROOT, 'docs', 'generated', 'safe-capsule');

function parseArgs(argv) {
  const args = { scenario: 'steady_progress', out: null, handoff: false };
  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (entry === '--handoff') {
      args.handoff = true;
    } else if (entry === '--scenario') {
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
  if (args.handoff) return createManualHandoffCliResult(args);
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

function createManualHandoffCliResult(args) {
  const scenarioIds = args.scenario === 'all_safe'
    ? ['steady_progress', 'struggling_streak', 'review_pressure_high', 'low_energy_focus']
    : [args.scenario];
  const results = scenarioIds.map(runSafeCapsuleRehearsalScenario);
  const rejected = results.find(result => !result.accepted || !result.mockPackage);
  if (rejected) {
    return {
      ok: false,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify({
        scenarioId: rejected.scenarioId,
        accepted: false,
        rejected: true,
        rejectionReasonCode: rejected.rejectionReasonCode,
        packageCreated: false
      }),
      error: rejected.rejectionReasonCode || 'REJECTED_UNSAFE_SCENARIO'
    };
  }

  const created = createManualSafeCapsuleHandoffPack(results.map(result => result.mockPackage), {
    createdAtBucket: '2026-07-08',
    exportId: args.scenario === 'all_safe' ? 'manual_handoff_all_safe' : `manual_handoff_${args.scenario}`,
    privacyEvidence: results.map(result => result.privacyEvidenceSummary)
  });
  if (!created.ok) {
    return {
      ok: false,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify({ packageCreated: false, error: created.error }),
      error: created.error
    };
  }

  const jsonl = serializeManualHandoffJsonl(created.handoffPack);
  const summary = {
    handoff: true,
    scenario: args.scenario,
    packageCount: created.handoffPack.manifest.packageCount,
    evidenceCount: created.handoffPack.manifest.evidenceCount,
    target: created.handoffPack.target,
    bridgeMode: created.handoffPack.bridgeMode,
    checksum32: created.handoffPack.verification.checksum32,
    realBridgeEnabled: created.handoffPack.realBridgeEnabled,
    transportEnabled: created.handoffPack.transportEnabled
  };

  if (!args.out) {
    return {
      ok: true,
      wroteFile: false,
      outputPath: null,
      stdout: JSON.stringify(summary),
      packageLine: jsonl,
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
  fs.writeFileSync(outputPath, jsonl, 'utf8');
  return {
    ok: true,
    wroteFile: true,
    outputPath,
    stdout: JSON.stringify({ ...summary, outputPath }),
    packageLine: jsonl,
    error: null
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = createSafeCapsuleMockImportPackageCliResult(process.argv.slice(2));
  process.stdout.write(`${result.stdout}\n`);
  if (!result.ok) process.exitCode = 1;
}
