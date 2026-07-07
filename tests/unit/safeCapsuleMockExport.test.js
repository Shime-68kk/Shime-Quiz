import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createStudyRoomSafeLearningCapsule } from '../../src/deviceBridge/studyRoomSafeCapsuleAdapter.js';
import { createSafeCapsuleMockExport } from '../../src/deviceBridge/safeCapsuleMockExport.js';

const FIXTURE_DIR = path.join(process.cwd(), 'tests/fixtures/safe-learning-capsule-adapter');

function capsuleFromFixture(name = 'derived-steady-session.json') {
  const summary = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
  return createStudyRoomSafeLearningCapsule(summary).capsule;
}

describe('safeCapsuleMockExport', () => {
  it('valid capsule serializes to safe mock envelope', () => {
    const result = createSafeCapsuleMockExport(capsuleFromFixture());

    expect(result.ok).toBe(true);
    expect(result.envelope).toMatchObject({
      exportMode: 'mock_only',
      destination: 'robot_mock_import',
      realBridgeEnabled: false,
      transportEnabled: false
    });
    expect(JSON.parse(result.serialized)).toEqual(result.envelope);
  });

  it('invalid capsule is rejected', () => {
    const capsule = { ...capsuleFromFixture(), checksum: 'ffffffff' };
    const result = createSafeCapsuleMockExport(capsule);

    expect(result.ok).toBe(false);
    expect(result.envelope).toBe(null);
    expect(result.summary.exportReadyForMockRobotImport).toBe(false);
  });

  it('raw fields never appear in envelope', () => {
    const result = createSafeCapsuleMockExport(capsuleFromFixture());
    const text = result.serialized;

    expect(text).not.toMatch(/prompt|question|answer|correctAnswer|explanation|userAnswer|studyHistory|sourceMetadata|cardId|deckId|SSID|BSSID|MAC|token|secret|password/i);
  });

  it('summary marks mock export readiness and safe capsule details', () => {
    const result = createSafeCapsuleMockExport(capsuleFromFixture());

    expect(result.summary).toMatchObject({
      capsuleFieldCount: 17,
      privacyClass: 'redacted_coarse_only',
      safeSummaryCode: 'STEADY_PROGRESS',
      blockedRawFieldCount: 0,
      exportReadyForMockRobotImport: true
    });
    expect(result.summary.checksum).toMatch(/^[a-f0-9]{8}$/);
  });

  it('source does not call network, storage, transport, or live device APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/safeCapsuleMockExport.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|mqtt/i);
    expect(source).not.toMatch(/new\s+DeviceBridge|StudyRoom\.jsx/i);
  });
});
