#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatRadarTofProtocolMarkdown } from '../src/robotSensing/radarTofTestProtocol.js';
import { runAllRadarTofScenarios, runRadarTofScenario } from '../src/robotSensing/radarTofScenarioSimulator.js';

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseArgs(argv) {
  const args = { all: false, json: false, scenario: null, protocol: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--all') args.all = true;
    else if (argv[index] === '--json') args.json = true;
    else if (argv[index] === '--protocol') args.protocol = true;
    else if (argv[index] === '--scenario') {
      args.scenario = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function summarize(result) {
  return {
    scenarioId: result.scenarioId,
    expectedState: result.expectedFusionState,
    actualState: result.actual.fusionState,
    confidence: result.actual.confidence,
    status: result.passed ? 'PASS' : 'FAIL',
    evidenceCodes: result.actual.evidenceCodes
  };
}

export function runRadarTofSensingCli(argv = []) {
  const args = parseArgs(argv);
  if (args.protocol) {
    return { ok: true, stdout: formatRadarTofProtocolMarkdown() };
  }
  const results = args.all ? runAllRadarTofScenarios() : [runRadarTofScenario(args.scenario || 'empty_room')];
  if (results.some(result => !result)) {
    return { ok: false, stdout: JSON.stringify({ status: 'FAIL', error: 'unknown_scenario' }) };
  }
  const summaries = results.map(summarize);
  const ok = summaries.every(item => item.status === 'PASS');
  if (args.json) return { ok, stdout: JSON.stringify({ ok, scenarios: summaries }, null, 2) };
  return {
    ok,
    stdout: summaries.map(item => `${item.scenarioId}: expected=${item.expectedState} actual=${item.actualState} confidence=${item.confidence} ${item.status} evidence=${item.evidenceCodes.join(',')}`).join('\n')
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = runRadarTofSensingCli(process.argv.slice(2));
  process.stdout.write(`${result.stdout}\n`);
  if (!result.ok) process.exitCode = 1;
}
