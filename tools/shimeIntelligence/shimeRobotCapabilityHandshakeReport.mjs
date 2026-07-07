import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRobotCapabilityHandshake, summarizeRobotCapabilityHandshake, validateRobotCapabilityHandshake } from '../../src/shimeIntelligence/robotCapabilityHandshake.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeRobotCapabilityHandshakeReport() {
  const handshakes = [
    createRobotCapabilityHandshake({ supportsDisplay: true, supportsLed: true, supportsWifi: true, supportsWebSocket: true }),
    createRobotCapabilityHandshake({ supportsDisplay: true, supportsBle: true, supportsPresenceSensor: true }),
    createRobotCapabilityHandshake({ supportsDisplay: true, supportsMotion: true, motionLocked: true })
  ];
  const summaries = handshakes.map(summarizeRobotCapabilityHandshake);
  const report = {
    status: handshakes.every(handshake => validateRobotCapabilityHandshake(handshake).ok) ? 'PASS' : 'FAIL',
    handshakeCount: handshakes.length,
    summaries,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-robot-capability-handshake.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeRobotCapabilityHandshakeReport();
  console.log(`[SHIME ROBOT HANDSHAKE] status=${report.status} handshakes=${report.handshakeCount} artifact=${path.relative(ROOT, artifact)}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
