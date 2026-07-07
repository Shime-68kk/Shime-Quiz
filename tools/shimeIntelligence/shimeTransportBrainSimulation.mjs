import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planTransportBrain } from '../../src/shimeIntelligence/transportBrain.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeTransportBrainSimulation() {
  const cases = [
    { deviceCapabilities: { supportsWifi: true, supportsWebSocket: true }, isSameLan: true, wifiHealth: 'good', latencyNeedBucket: 'live', userConsentState: 'explicit_yes' },
    { deviceCapabilities: { supportsBle: true }, pairingState: 'new', userConsentState: 'explicit_yes' },
    { deviceCapabilities: { supportsSoftAp: true }, softApAvailable: true, userConsentState: 'explicit_yes' },
    { deviceCapabilities: { supportsUsbSerial: true }, appPlatform: 'dev', userConsentState: 'explicit_yes' },
    { privacyMode: 'raw', userConsentState: 'explicit_yes' }
  ];
  const report = cases.map((entry, index) => ({ scenarioId: `transport_${index + 1}`, ...planTransportBrain(entry) }));
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-transport-brain-simulation.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeTransportBrainSimulation();
  console.log(`[SHIME TRANSPORT] scenarios=${report.length} artifact=${path.relative(ROOT, artifact)}`);
}
