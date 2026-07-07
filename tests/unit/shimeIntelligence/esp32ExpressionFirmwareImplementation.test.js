import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const forbiddenSensitive = [
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
];

describe('esp32ExpressionFirmwareImplementation', () => {
  it('generates valid, invalid, real-world, and expected-log fixtures', () => {
    const valid = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-valid.ndjson', 'utf8').trim().split('\n');
    const invalid = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-invalid.ndjson', 'utf8').trim().split('\n');
    const realworld = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-realworld-invalid.ndjson', 'utf8').trim().split('\n');
    const logs = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-expected-logs.ndjson', 'utf8').trim().split('\n');
    expect(valid.length).toBeGreaterThanOrEqual(12);
    expect(invalid.length).toBeGreaterThanOrEqual(20);
    expect(realworld.length).toBeGreaterThanOrEqual(10);
    expect(logs.length).toBe(valid.length + invalid.length);
  });

  it('keeps valid payloads and accepted logs free of forbidden sensitive fields', () => {
    const valid = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-valid.ndjson', 'utf8');
    const acceptedLogs = fs.readFileSync('firmware/esp32-shime-robot/fixtures/expression-expected-logs.ndjson', 'utf8')
      .split('\n')
      .filter(line => line.includes('"accepted":true'))
      .join('\n');
    forbiddenSensitive.forEach(key => {
      expect(valid).not.toContain(key);
      expect(acceptedLogs).not.toContain(key);
    });
  });

  it('firmware parser source has log-only safety boundaries', () => {
    const source = [
      'firmware/esp32-shime-robot/src/main.cpp',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
      'firmware/esp32-shime-robot/include/ShimeProtocol.h'
    ].map(file => fs.readFileSync(file, 'utf8')).join('\n');
    expect(source).toContain('parseExpressionEnvelope');
    expect(source).toContain('logForExpressionResult');
    expect(source).not.toContain('WiFi.begin');
    expect(source).not.toContain('digitalWrite(');
    expect(source).not.toContain('analogWrite(');
    expect(source).not.toContain('ledcWrite(');
    expect(source).not.toContain('Servo(');
  });
});
