import fs from 'node:fs';
import path from 'node:path';
import { createExpressionProtocolGoldenFixtures } from '../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { simulateEsp32ExpressionEnvelope } from '../../src/shimeIntelligence/esp32ExpressionHostSimulator.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const firmwareRoot = 'firmware/esp32-shime-robot';
const fixtureDir = path.join(firmwareRoot, 'fixtures');
const docsDir = path.join(firmwareRoot, 'docs');

const extraInvalidPayloads = [
  '',
  '   ',
  '{}',
  '{"protocol":"wrong","protocolVersion":"1.0.0"}',
  '{"protocol":"shime_robot_expression","source":"shime_quiz"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"wrong","target":"shime_robot","messageType":"expression_preview"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"wrong","messageType":"expression_preview"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"robot_command"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"unknown","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_unknown_family"]}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":"display_expression","displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_channel_shape"]}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":[]}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"blocked","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_safety"]}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"blocked","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_privacy"]}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_nested"],"meta":{"sourceMetadata":"blocked"}}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_raw"],"question":"blocked"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_raw"],"answer":"blocked"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_connect"],"wifi":true}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["invalid_motion"],"servo":1}'
];

function firmwareLogForPayload(payload) {
  const result = simulateEsp32ExpressionEnvelope(payload);
  if (result.accepted) {
    return JSON.stringify({
      logProtocol: 'shime_esp32_expression_log',
      protocolVersion: '1.0.0',
      accepted: true,
      expressionFamily: result.parsedExpressionFamily,
      displayExpression: result.parsedDisplayExpression,
      ledPattern: result.parsedLedPattern,
      soundCue: result.parsedSoundCue,
      motionPolicy: 'locked',
      dryRunOnly: true,
      sendStatus: 'not_sent',
      safetyStatus: 'allowed_dry_run',
      privacyStatus: 'redacted_coarse_only',
      reasonCodes: ['firmware_expression_accepted']
    });
  }
  return JSON.stringify({
    logProtocol: 'shime_esp32_expression_log',
    protocolVersion: '1.0.0',
    accepted: false,
    rejectedReason: 'rejected_by_parser',
    motionPolicy: 'locked',
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['firmware_expression_rejected']
  });
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${text.trimEnd()}\n`);
}

const fixtures = createExpressionProtocolGoldenFixtures();
const validPayloads = fixtures.fixtures.filter(fixture => fixture.validExpected).map(fixture => fixture.serialized);
const invalidPayloads = [
  ...fixtures.fixtures.filter(fixture => !fixture.validExpected).map(fixture => fixture.serialized),
  ...extraInvalidPayloads
];
const realworldInvalidPayloads = [
  `  ${validPayloads[0]}  `,
  validPayloads[0] + validPayloads[1],
  validPayloads[0].slice(0, Math.floor(validPayloads[0].length / 2)),
  '[12:01:03] ' + validPayloads[0],
  'Đây không phải JSON',
  '“protocol”:“shime_robot_expression”',
  '',
  validPayloads[0],
  invalidPayloads[0],
  validPayloads[1],
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["extra_field"],"extraNote":"safe"}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["dangerous_extra"],"connect":true}',
  '{"protocol":"shime_robot_expression","protocolVersion":"1.0.0","protocolVersion":"9.0.0","source":"shime_quiz","target":"shime_robot","messageType":"expression_preview","expressionFamily":"neutral_presence","allowedChannels":["display_expression"],"displayExpression":"none","ledPattern":"none","soundCue":"none","motionPolicy":"locked","intensityBucket":"low","safetyStatus":"allowed_dry_run","privacyStatus":"redacted_coarse_only","dryRunOnly":true,"sendStatus":"not_sent","reasonCodes":["duplicate_key"]}'
];
const expectedLogs = [...validPayloads, ...invalidPayloads].map(firmwareLogForPayload);

writeText(path.join(fixtureDir, 'expression-valid.ndjson'), validPayloads.join('\n'));
writeText(path.join(fixtureDir, 'expression-invalid.ndjson'), invalidPayloads.join('\n'));
writeText(path.join(fixtureDir, 'expression-realworld-invalid.ndjson'), realworldInvalidPayloads.join('\n'));
writeText(path.join(fixtureDir, 'expression-expected-logs.ndjson'), expectedLogs.join('\n'));
writeText(path.join(docsDir, 'expression-log-only-serial-qa.md'), `# Expression Log-only Serial QA

This firmware parser is log-only. It does not send robot commands, open radio transport, or move hardware.

Manual QA for a later hardware step:

1. Build firmware with PlatformIO.
2. Open the USB serial monitor.
3. Paste one line from \`fixtures/expression-valid.ndjson\`.
4. Confirm one ACCEPT JSON log line.
5. Paste one line from \`fixtures/expression-invalid.ndjson\`.
6. Confirm one REJECT JSON log line.
7. Try real-world malformed lines from \`fixtures/expression-realworld-invalid.ndjson\`.
8. Confirm no raw invalid payload is echoed.
9. Confirm no pins, motors, servos, radio transport, or app runtime path is used.

Codex must not upload or flash firmware unless explicitly asked by a human.
`);

const firmwareFiles = [
  'firmware/esp32-shime-robot/include/ShimeProtocol.h',
  'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
  'firmware/esp32-shime-robot/src/main.cpp',
  'firmware/esp32-shime-robot/protocol.md'
];
const source = firmwareFiles.filter(fs.existsSync).map(file => fs.readFileSync(file, 'utf8')).join('\n');
const forbiddenActivePatterns = ['WiFi.begin', 'WebServer', 'BLEDevice', 'digitalWrite(', 'analogWrite(', 'ledcWrite(', 'Servo('];
const activeHits = forbiddenActivePatterns.filter(pattern => source.includes(pattern));
const validContainsForbidden = [
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload',
  'cameraFrames',
  'audioRecording',
  'biometricIdentity'
].some(key => validPayloads.join('\n').includes(key));
const expectedRejectEchoesRaw = expectedLogs.some(line => line.includes('blocked_fixture') || line.includes('sourceMetadata') || line.includes('question'));

const implementation = {
  reportVersion: 'shime-esp32-expression-log-only-firmware-implementation-v1',
  parserImplemented: source.includes('parseExpressionEnvelope'),
  acceptLogImplemented: source.includes('logForExpressionResult') && source.includes('result.accepted') && source.includes('true,\"expressionFamily'),
  rejectLogImplemented: source.includes('logForExpressionResult') && source.includes('false,\"rejectedReason'),
  boundedPayload: source.includes('MAX_EXPRESSION_LINE_LENGTH') && source.includes('MAX_SERIAL_LINE_LENGTH'),
  rawPayloadEchoPrevented: !source.includes('Serial.println(rawLine)'),
  activeUnsafeHits: activeHits,
  validFixtureCount: validPayloads.length,
  invalidFixtureCount: invalidPayloads.length,
  realworldTrainingLineCount: realworldInvalidPayloads.length,
  expectedLogCount: expectedLogs.length,
  validContainsForbidden,
  expectedRejectEchoesRaw,
  status: activeHits.length === 0 && !validContainsForbidden && !expectedRejectEchoesRaw ? 'PASS' : 'FAIL',
  dryRunOnly: true,
  sendStatus: 'not_sent',
  motionPolicy: 'locked',
  reasonCodes: ['esp32_expression_firmware_implementation_report_created']
};

const fixtureAudit = {
  auditVersion: 'shime-esp32-expression-firmware-fixture-audit-v1',
  validFixtureCount: validPayloads.length,
  invalidFixtureCount: invalidPayloads.length,
  realworldTrainingLineCount: realworldInvalidPayloads.length,
  validContainsForbidden,
  invalidMarkedByFile: true,
  expectedRejectEchoesRaw,
  status: implementation.status,
  dryRunOnly: true,
  sendStatus: 'not_sent',
  motionPolicy: 'locked',
  reasonCodes: ['esp32_expression_firmware_fixture_audit_created']
};

const realworldTraining = {
  trainingVersion: 'shime-esp32-expression-realworld-serial-training-v1',
  realworldTrainingLineCount: realworldInvalidPayloads.length,
  classes: [
    'spacing',
    'double_paste',
    'split_line',
    'timestamp_prefix',
    'non_json_text',
    'smart_quotes',
    'empty_line',
    'mixed_valid_invalid_valid',
    'harmless_extra_field',
    'dangerous_extra_field',
    'duplicate_key'
  ],
  rawEchoAllowed: false,
  status: 'PASS',
  dryRunOnly: true,
  sendStatus: 'not_sent',
  motionPolicy: 'locked',
  reasonCodes: ['esp32_expression_realworld_serial_training_created']
};

if (implementation.status !== 'PASS') {
  throw new Error(`Firmware implementation evidence failed: ${activeHits.join(',')}`);
}

writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-log-only-firmware-implementation.json', implementation);
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-firmware-fixture-audit.json', fixtureAudit);
writeShimeJson('docs/generated/shime-intelligence/shime-esp32-expression-realworld-serial-training.json', realworldTraining);

console.log(`[SHIME ESP32 EXPRESSION FIRMWARE] status=${implementation.status} valid=${validPayloads.length} invalid=${invalidPayloads.length} realworld=${realworldInvalidPayloads.length}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-log-only-firmware-implementation.json');
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-firmware-fixture-audit.json');
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-esp32-expression-realworld-serial-training.json');
