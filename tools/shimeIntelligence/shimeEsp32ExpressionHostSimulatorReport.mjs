import fs from 'node:fs';
import { simulateEsp32ExpressionEnvelope } from '../../src/shimeIntelligence/esp32ExpressionHostSimulator.js';
import { createExpressionProtocolGoldenFixtures } from '../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const golden = JSON.parse(fs.readFileSync('docs/generated/shime-intelligence/shime-expression-envelope-golden.json', 'utf8'));
const accepted = simulateEsp32ExpressionEnvelope(golden);
const fixtures = createExpressionProtocolGoldenFixtures();
const acceptedFixtures = fixtures.fixtures
  .filter(fixture => fixture.validExpected)
  .map(fixture => simulateEsp32ExpressionEnvelope(fixture.envelope));
const rejectedFixtures = fixtures.fixtures
  .filter(fixture => !fixture.validExpected)
  .map(fixture => simulateEsp32ExpressionEnvelope(fixture.serialized));

const report = {
  simulatorReportVersion: 'shime-esp32-expression-host-simulator-report-v1',
  goldenAccepted: accepted.accepted === true,
  validAcceptedCount: acceptedFixtures.filter(result => result.accepted).length,
  invalidRejectedCount: rejectedFixtures.filter(result => !result.accepted).length,
  validFixtureCount: acceptedFixtures.length,
  invalidFixtureCount: rejectedFixtures.length,
  sampleAccepted: accepted,
  dryRunOnly: true,
  sendStatus: 'not_sent',
  motionPolicy: 'locked',
  reasonCodes: ['esp32_expression_host_simulator_report_created']
};

if (!report.goldenAccepted || report.validAcceptedCount !== report.validFixtureCount || report.invalidRejectedCount !== report.invalidFixtureCount) {
  throw new Error('Host simulator report failed.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-host-simulator.json', report);
console.log(`[SHIME ESP32 HOST SIMULATOR] status=PASS valid=${report.validAcceptedCount} invalid=${report.invalidRejectedCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-host-simulator.json');

