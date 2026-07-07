#!/usr/bin/env node
import { createCompanionBridgeSimulationTranscript } from './companionBridgeSimulator.mjs';
import { companionBridgeSimulationFixtures } from './companionBridgeSimulationFixtures.mjs';

const DEMO_SCENARIOS = [
  'normal_short_study_session',
  'correct_streak_session',
  'repeated_wrong_answers',
  'transport_disconnected_mid_session',
  'high_accuracy_completion',
  'sensitive_payload_attack'
];

export function createCompanionPremiumDemoTranscript() {
  const selected = companionBridgeSimulationFixtures.filter(scenario => DEMO_SCENARIOS.includes(scenario.name));
  return [
    '[PREMIUM COMPANION DEMO] local deterministic companion simulation',
    '[PREMIUM COMPANION DEMO] no quiz content, private responses, identifying media, cloud, or robot motion',
    ...createCompanionBridgeSimulationTranscript(selected),
    '[PREMIUM COMPANION DEMO] end'
  ];
}

export function printCompanionPremiumDemoTranscript(log = console.log) {
  const lines = createCompanionPremiumDemoTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printCompanionPremiumDemoTranscript();
}
