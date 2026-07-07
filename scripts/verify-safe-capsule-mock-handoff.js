#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySafeCapsuleEndToEndVerificationAction, createInitialSafeCapsuleEndToEndVerificationState, SAFE_CAPSULE_E2E_ACTIONS } from '../src/components/settings/safeCapsuleEndToEndVerificationModel.js';
import { verifyRobotMockImportReport } from '../src/deviceBridge/robotMockImportReport.js';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const RAW_VALUE_PATTERN = /private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/i;

function parseArgs(argv) {
  const args = { demoPass: false, demoFailChecksum: false, handoff: null, report: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--demo-pass') args.demoPass = true;
    else if (argv[i] === '--demo-fail-checksum') args.demoFailChecksum = true;
    else if (argv[i] === '--handoff') { args.handoff = argv[i + 1]; i += 1; }
    else if (argv[i] === '--report') { args.report = argv[i + 1]; i += 1; }
  }
  return args;
}

function demo(failChecksum = false) {
  let state = createInitialSafeCapsuleEndToEndVerificationState();
  state = applySafeCapsuleEndToEndVerificationAction(state, SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF);
  state = applySafeCapsuleEndToEndVerificationAction(state, failChecksum ? SAFE_CAPSULE_E2E_ACTIONS.CREATE_FAILING_CHECKSUM_REPORT : SAFE_CAPSULE_E2E_ACTIONS.CREATE_MATCHING_REPORT);
  state = applySafeCapsuleEndToEndVerificationAction(state, SAFE_CAPSULE_E2E_ACTIONS.VERIFY);
  return {
    ok: state.endToEndPass,
    stdout: JSON.stringify({
      status: state.overallStatus,
      endToEndPass: state.endToEndPass,
      recommendedNextStepCode: state.recommendedNextStepCode,
      realBridgeAllowed: state.readinessGate.realBridgeAllowed,
      transportDisabledPass: state.transportDisabledPass
    })
  };
}

export function verifySafeCapsuleMockHandoffCliResult(argv = []) {
  const args = parseArgs(argv);
  if (args.demoPass) return demo(false);
  if (args.demoFailChecksum) return demo(true);
  if (!args.handoff || !args.report) {
    return { ok: false, stdout: JSON.stringify({ status: 'missing_args', endToEndPass: false }) };
  }
  const handoffText = fs.readFileSync(path.resolve(args.handoff), 'utf8');
  const report = JSON.parse(fs.readFileSync(path.resolve(args.report), 'utf8'));
  if (RAW_VALUE_PATTERN.test(handoffText) || RAW_VALUE_PATTERN.test(JSON.stringify(report))) {
    return { ok: false, stdout: JSON.stringify({ status: 'blocked_raw_value_echo', endToEndPass: false }) };
  }
  const handoffPack = { lines: handoffText.trim().split('\n').filter(Boolean) };
  const verified = verifyRobotMockImportReport(report, handoffPack);
  return {
    ok: verified.ok,
    stdout: JSON.stringify({
      status: verified.status,
      endToEndPass: verified.ok,
      capsuleCountMatch: verified.capsuleCountMatch,
      checksumMatch: verified.checksumMatch,
      privacyPass: verified.privacyPass,
      realBridgeAllowed: false
    })
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = verifySafeCapsuleMockHandoffCliResult(process.argv.slice(2));
  process.stdout.write(`${result.stdout}\n`);
  if (!result.ok) process.exitCode = 1;
}
