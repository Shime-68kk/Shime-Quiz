#!/usr/bin/env node
import { processDeviceBridgeEventSequence } from '../../src/companion/companionBridgePipeline.js';
import { formatCompanionTranscript } from '../../src/companion/companionTranscriptBuilder.js';
import { companionBridgeSimulationFixtures } from './companionBridgeSimulationFixtures.mjs';

export function runCompanionBridgeSimulation(scenarios = companionBridgeSimulationFixtures) {
  return scenarios.map(scenario => {
    const output = processDeviceBridgeEventSequence(scenario.events, {
      contextId: `bridge_${scenario.name}`,
      profile: scenario.profile || 'calm_companion',
      presenceSignal: scenario.presenceSignal,
      motionAllowed: scenario.motionAllowed === true,
      childSafeMode: scenario.childSafeMode !== false,
      timestamp: '2026-06-27T00:00:00.000Z'
    });
    return { scenario: scenario.name, invalid: scenario.invalid === true, ...output };
  });
}

export function createCompanionBridgeSimulationTranscript(scenarios = companionBridgeSimulationFixtures) {
  return runCompanionBridgeSimulation(scenarios).flatMap(result => [
    `[COMPANION BRIDGE SIM] scenario=${result.scenario}`,
    ...formatCompanionTranscript(result.results.map((entry, index) => ({ ...entry, step: index + 1 }))),
    `[COMPANION BRIDGE SIM] report events=${result.report.eventCount} accepted=${result.report.acceptedCount} rejected=${result.report.rejectedCount} blocked=${result.report.blockedCount} commands=${result.report.robotCommands.join('|')}`
  ]);
}

export function printCompanionBridgeSimulationTranscript(log = console.log) {
  const lines = createCompanionBridgeSimulationTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printCompanionBridgeSimulationTranscript();
}
